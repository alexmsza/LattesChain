#!/usr/bin/env node
/**
 * LattesChain / EduCore - Validator Test & Template Generator CLI
 * 
 * Facilitates running, checking, and generating test templates against
 * a Solana local validator (solana-test-validator) with cloned devnet dependencies.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

// Cloned dependencies required by LattesChain
const ESSENTIAL_PROGRAMS = {
  SPL_MEMO: {
    name: "SPL Memo Program",
    address: "Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo",
    requiredFor: "EduCore log_academic_event CPI audit trail",
  },
  SAS: {
    name: "Solana Attestation Service (SAS)",
    address: "22zoJMtdu4tQc2PzL74ZUT7FrwgB1Udec8DdW4yw4BdG",
    requiredFor: "LattesChain python SAS credentials & attestations",
  },
};

const DEFAULT_RPC = process.env.EDUCORE_RPC_URL || "http://127.0.0.1:8899";

function printBanner() {
  console.log(`\x1b[36m
╔══════════════════════════════════════════════════════════════╗
║     LattesChain / EduCore — Validator Template & Test CLI    ║
║     Solana Localnet & Attestation Test Automation Tool       ║
╚══════════════════════════════════════════════════════════════╝\x1b[0m`);
}

/**
 * Health check on local validator
 */
async function checkValidator(rpcUrl = DEFAULT_RPC) {
  printBanner();
  console.log(`\n🔍 Verificando Validador em \x1b[33m${rpcUrl}\x1b[0m...`);

  try {
    const connection = new Connection(rpcUrl, "confirmed");
    const version = await connection.getVersion();
    const slot = await connection.getSlot();
    const blockHeight = await connection.getBlockHeight();

    console.log(`\x1b[32m✔ Validador ativo e respondendo!\x1b[0m`);
    console.log(`  • Versão Solana : ${version["solana-core"] || JSON.stringify(version)}`);
    console.log(`  • Slot Atual    : ${slot}`);
    console.log(`  • Block Height  : ${blockHeight}`);

    console.log(`\n📦 Verificando Programas Clonados Essenciais:`);
    for (const [key, prog] of Object.entries(ESSENTIAL_PROGRAMS)) {
      const pubkey = new PublicKey(prog.address);
      const accInfo = await connection.getAccountInfo(pubkey);

      if (accInfo && accInfo.executable) {
        console.log(`  \x1b[32m✔ [OK] ${prog.name}\x1b[0m`);
        console.log(`    Address : ${prog.address}`);
        console.log(`    Propósito: ${prog.requiredFor}`);
      } else if (accInfo && !accInfo.executable) {
        console.log(`  \x1b[33m⚠ [WARN] ${prog.name} existe mas não é executável!\x1b[0m (${prog.address})`);
      } else {
        console.log(`  \x1b[31m✖ [FALTANDO] ${prog.name} NÃO encontrado no validador!\x1b[0m`);
        console.log(`    Address: ${prog.address}`);
        console.log(`    Dica: Inicie o validador com: \x1b[36mnpm run validator:start\x1b[0m para clonar da Devnet.`);
      }
    }

    console.log(`\n\x1b[32mAmbiente pronto para testes Anchor e pipeline SAS local.\x1b[0m\n`);
  } catch (err) {
    console.error(`\x1b[31m✖ Erro ao conectar ao validador em ${rpcUrl}:\x1b[0m`);
    console.error(`  ${err.message}`);
    console.log(`\n💡 Dica: Inicie o validador local executando:`);
    console.log(`  \x1b[36mnpm run validator:start\x1b[0m\n`);
    process.exit(1);
  }
}

/**
 * Print command to start solana-test-validator with cloned programs
 */
function printStartCommand() {
  printBanner();
  const cmd = [
    "solana-test-validator",
    "--reset",
    "--url https://api.devnet.solana.com",
    `--clone ${ESSENTIAL_PROGRAMS.SPL_MEMO.address}`,
    `--clone ${ESSENTIAL_PROGRAMS.SAS.address}`,
  ].join(" \\\n  ");

  console.log(`\n🚀 \x1b[1mComando para iniciar o validador com dependências clonadas:\x1b[0m\n`);
  console.log(`\x1b[32m${cmd}\x1b[0m\n`);
  console.log(`Ou simplesmente execute:\n  \x1b[36mnpm run validator:start\x1b[0m\n`);
}

/**
 * Templates for generating tests
 */
const TEMPLATES = {
  anchor: (testName) => `import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { expect } from "chai";

describe("${testName} - EduCore Test Scenario", () => {
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
`,

  python: (testName) => `"""
${testName}.py — Teste de Validador Local para Solana Attestation Service (SAS)

Executa contra o validador local clonado (http://127.0.0.1:8899).
"""

import os
import sys
from pathlib import Path

# Adiciona o diretório sas ao path para importar sas_client e sas_core
SAS_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SAS_DIR))

# Força URL do validador local se não especificada
os.environ.setdefault("EDUCORE_RPC_URL", "http://127.0.0.1:8899")

from sas_client import get_client, DEVNET_URL
from sas_core import SAS_PROGRAM_ID

def test_local_validator_connection():
    client = get_client()
    version = client.get_version()
    print(f"✔ Conectado ao Validador: {version.value}")
    
    # Verifica se o programa SAS está presente no validador
    acc_info = client.get_account_info(SAS_PROGRAM_ID)
    assert acc_info.value is not None, "Programa SAS não encontrado! Execute com programas clonados."
    assert acc_info.value.executable, "Conta SAS não está marcada como executável!"
    print(f"✔ Programa SAS {SAS_PROGRAM_ID} presente e executável no validador local!")

if __name__ == "__main__":
    print("=== Executando Teste SAS Local ===")
    test_local_validator_connection()
    print("=== Teste Concluído com Sucesso ===")
`,

  bankrun: (testName) => `import { startAnchor } from "solana-bankrun";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";
import path from "path";

describe("${testName} - Fast Bankrun In-Memory Test", () => {
  it("Runs fast tests without external validator daemon", async () => {
    const contractsDir = path.resolve(__dirname, "..");
    
    // Bankrun boots a Solana runtime in-memory in ~10ms!
    const context = await startAnchor(
      contractsDir,
      [], // additional programs
      []  // additional accounts
    );

    const client = context.banksClient;
    const payer = context.payer;

    const balance = await client.getBalance(payer.publicKey);
    expect(balance).to.be.greaterThan(BigInt(0));
    console.log("Bankrun runtime active, balance:", balance.toString());
  });
});
`,
};

/**
 * Generate a new test template
 */
function generateTemplate(type, name) {
  printBanner();
  const validTypes = Object.keys(TEMPLATES);

  if (!validTypes.includes(type)) {
    console.error(`\x1b[31m✖ Tipo inválido '${type}'. Tipos suportados: ${validTypes.join(", ")}\x1b[0m`);
    process.exit(1);
  }

  const sanitizedName = (name || `test_${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, "_");

  let targetDir;
  let fileName;

  if (type === "anchor" || type === "bankrun") {
    targetDir = path.join(ROOT_DIR, "educore_contracts", "tests");
    fileName = `${sanitizedName}.${type === "bankrun" ? "bankrun.ts" : "spec.ts"}`;
  } else if (type === "python") {
    targetDir = path.join(ROOT_DIR, "sas", "tests");
    fileName = `${sanitizedName}.py`;
  }

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const filePath = path.join(targetDir, fileName);

  if (fs.existsSync(filePath)) {
    console.error(`\x1b[31m✖ Arquivo já existe:\x1b[0m ${filePath}`);
    process.exit(1);
  }

  const content = TEMPLATES[type](sanitizedName);
  fs.writeFileSync(filePath, content, "utf-8");

  console.log(`\n\x1b[32m✔ Template '${type}' gerado com sucesso!\x1b[0m`);
  console.log(`  Arquivo: \x1b[36m${filePath}\x1b[0m\n`);
  
  if (type === "anchor") {
    console.log(`Para executar este teste:`);
    console.log(`  \x1b[33mcd educore_contracts && npx ts-mocha -p ./tsconfig.json tests/${fileName}\x1b[0m\n`);
  } else if (type === "python") {
    console.log(`Para executar este teste em Python:`);
    console.log(`  \x1b[33mpython sas/tests/${fileName}\x1b[0m\n`);
  }
}

// CLI Argument parsing
const args = process.argv.slice(2);
const command = args[0] || "help";

switch (command) {
  case "check":
  case "health": {
    const rpc = args[1] || DEFAULT_RPC;
    checkValidator(rpc);
    break;
  }
  case "start":
  case "cmd": {
    printStartCommand();
    break;
  }
  case "generate":
  case "create": {
    const type = args[1] || "anchor";
    const name = args[2] || `scenario_${Date.now()}`;
    generateTemplate(type, name);
    break;
  }
  case "help":
  default: {
    printBanner();
    console.log(`
Uso:
  node scripts/validator-template-generator.mjs <comando> [opções]

Comandos:
  \x1b[36mcheck\x1b[0m [rpcUrl]              Verifica se o validador local está ativo e com programas essenciais clonados (Memo, SAS).
  \x1b[36mstart\x1b[0m                      Exibe o comando completo para iniciar o solana-test-validator com clonagem.
  \x1b[36mgenerate\x1b[0m <tipo> <nome>       Gera um novo template de teste.
                                Tipos disponíveis:
                                  • \x1b[33manchor\x1b[0m   (Testes TypeScript Anchor em educore_contracts/tests/)
                                  • \x1b[33mpython\x1b[0m   (Testes Python SAS contra validador em sas/tests/)
                                  • \x1b[33mbankrun\x1b[0m  (Testes rápidos in-memory via solana-bankrun)

Exemplos:
  npm run validator:check
  npm run validator:start
  npm run validator:template -- anchor test_batch_emissions
  npm run validator:template -- python test_local_attestation
`);
    break;
  }
}
