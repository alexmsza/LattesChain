import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("test_batch_issuance - EduCore Test Scenario", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.EducoreContracts as Program<any>;
  const authority = provider.wallet;

  // Master Registry PDA
  const [masterRegistryPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("master_registry")],
    program.programId
  );

  // Institution Keypair & PDA
  const institutionKeypair = anchor.web3.Keypair.generate();
  const [universityRecordPda] = anchor.web3.PublicKey.findProgramAddressSync(
    [Buffer.from("university_record"), institutionKeypair.publicKey.toBuffer()],
    program.programId
  );

  before(async () => {
    // Setup and fund institution for testing
    const fundTx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.transfer({
        fromPubkey: authority.publicKey,
        toPubkey: institutionKeypair.publicKey,
        lamports: 0.5 * anchor.web3.LAMPORTS_PER_SOL,
      })
    );
    await provider.sendAndConfirm(fundTx);
  });

  it("Executes custom test scenario", async () => {
    // TODO: Implement your custom assertions here
    expect(true).to.be.true;
  });
});
