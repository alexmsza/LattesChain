import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("EduCore Protocol - Validator Integration Tests", () => {
  // Configures the client to use the local cluster specified in Anchor.toml
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // We can load either through IDL workspace or direct program ID
  const program = anchor.workspace.EducoreContracts as Program<any>;
  const authority = provider.wallet;

  // Master Registry PDA derivation: seeds = ["master_registry"]
  const [masterRegistryPda, masterRegistryBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("master_registry")],
    program.programId
  );

  // University keypair and PDA derivation: seeds = ["university_record", institutionPubkey]
  const institutionKeypair = anchor.web3.Keypair.generate();
  const [universityRecordPda, universityRecordBump] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("university_record"), institutionKeypair.publicKey.toBuffer()],
    program.programId
  );

  const MEMO_PROGRAM_ID = new anchor.web3.PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo");

  it("1. Initializes the Master Registry (global protocol state)", async () => {
    const tx = await program.methods
      .initializeRegistry()
      .accounts({
        masterRegistry: masterRegistryPda,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    expect(tx).to.be.a("string");

    const registry = await program.account.masterRegistry.fetch(masterRegistryPda);
    expect(registry.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    expect(registry.isPaused).to.be.false;
    expect(registry.totalInstitutions.toNumber()).to.equal(0);
    expect(registry.totalEventsLogged.toNumber()).to.equal(0);
  });

  it("2. Registers a valid University (14-digit CNPJ)", async () => {
    const cnpj = "12345678000199";
    const name = "Universidade Federal do LattesChain";

    await program.methods
      .registerUniversity(cnpj, name)
      .accounts({
        masterRegistry: masterRegistryPda,
        universityRecord: universityRecordPda,
        institutionPubkey: institutionKeypair.publicKey,
        authority: authority.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    const record = await program.account.universityRecord.fetch(universityRecordPda);
    expect(record.name).to.equal(name);
    expect(record.isActive).to.be.true;
    expect(record.totalEmissions.toNumber()).to.equal(0);

    const registry = await program.account.masterRegistry.fetch(masterRegistryPda);
    expect(registry.totalInstitutions.toNumber()).to.equal(1);
  });

  it("3. Fails to register with invalid CNPJ format or length", async () => {
    const invalidKeypair = anchor.web3.Keypair.generate();
    const [invalidRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("university_record"), invalidKeypair.publicKey.toBuffer()],
      program.programId
    );

    try {
      await program.methods
        .registerUniversity("12345", "Invalid CNPJ University")
        .accounts({
          masterRegistry: masterRegistryPda,
          universityRecord: invalidRecordPda,
          institutionPubkey: invalidKeypair.publicKey,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      expect.fail("Should have failed with InvalidCNPJLength");
    } catch (err: any) {
      expect(err.message).to.include("InvalidCNPJLength");
    }
  });

  it("4. Logs an academic event with CPI to SPL Memo", async () => {
    // Fund the institution keypair with SOL for transaction fees
    const fundTx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: authority.publicKey,
        toPubkey: institutionKeypair.publicKey,
        lamports: 0.5 * anchor.web3.LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(fundTx);

    // 64-char SHA256 hex hash
    const documentHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const icpSignature = "MEYCIQC+SampleIcpBrasilSignatureBase64String==";
    const metadataUri = "https://gateway.irys.xyz/sample-academic-event-metadata";

    // DocumentType enum: { diploma: {} } or { horasComplementares: {} }
    const tx = await program.methods
      .logAcademicEvent(
        documentHash,
        icpSignature,
        { diploma: {} },
        metadataUri
      )
      .accounts({
        masterRegistry: masterRegistryPda,
        universityRecord: universityRecordPda,
        institutionSigner: institutionKeypair.publicKey,
        memoProgram: MEMO_PROGRAM_ID,
      })
      .signers([institutionKeypair])
      .rpc();

    expect(tx).to.be.a("string");

    const record = await program.account.universityRecord.fetch(universityRecordPda);
    expect(record.totalEmissions.toNumber()).to.equal(1);

    const registry = await program.account.masterRegistry.fetch(masterRegistryPda);
    expect(registry.totalEventsLogged.toNumber()).to.equal(1);
  });

  it("5. Rejects academic event logging if signer is unauthorized", async () => {
    const maliciousSigner = anchor.web3.Keypair.generate();
    
    // Fund malicious signer so signature validation can proceed
    const fundTx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: authority.publicKey,
        toPubkey: maliciousSigner.publicKey,
        lamports: 0.1 * anchor.web3.LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(fundTx);

    const documentHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    const icpSignature = "malicious_attempt";

    try {
      await program.methods
        .logAcademicEvent(
          documentHash,
          icpSignature,
          { certificadoCurso: {} },
          null
        )
        .accounts({
          masterRegistry: masterRegistryPda,
          universityRecord: universityRecordPda,
          institutionSigner: maliciousSigner.publicKey,
          memoProgram: MEMO_PROGRAM_ID,
        })
        .signers([maliciousSigner])
        .rpc();
      expect.fail("Should have thrown UnauthorizedInstitution");
    } catch (err: any) {
      expect(err.message).to.include("UnauthorizedInstitution");
    }
  });

  it("6. Toggles university status (deactivate and verify emission fails)", async () => {
    // Authority deactivates the university
    await program.methods
      .updateUniversityStatus(false)
      .accounts({
        masterRegistry: masterRegistryPda,
        universityRecord: universityRecordPda,
        authority: authority.publicKey,
      })
      .rpc();

    const record = await program.account.universityRecord.fetch(universityRecordPda);
    expect(record.isActive).to.be.false;

    // Institution attempts to emit while inactive
    const documentHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    try {
      await program.methods
        .logAcademicEvent(
          documentHash,
          "sig",
          { horasComplementares: {} },
          null
        )
        .accounts({
          masterRegistry: masterRegistryPda,
          universityRecord: universityRecordPda,
          institutionSigner: institutionKeypair.publicKey,
          memoProgram: MEMO_PROGRAM_ID,
        })
        .signers([institutionKeypair])
        .rpc();
      expect.fail("Should have failed with UniversityInactive");
    } catch (err: any) {
      expect(err.message).to.include("UniversityInactive");
    }

    // Reactivate for future tests
    await program.methods
      .updateUniversityStatus(true)
      .accounts({
        masterRegistry: masterRegistryPda,
        universityRecord: universityRecordPda,
        authority: authority.publicKey,
      })
      .rpc();
  });
});
