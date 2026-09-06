import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();

  return NextResponse.json({
    status: "healthy",
    protocol: "LattesChain (EduCore Protocol)",
    version: "v1.0.0",
    network: process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet",
    rpc_endpoint: process.env.NEXT_PUBLIC_SOLANA_RPC_URL ? "custom_rpc" : "solana_public_cluster",
    compliance: ["MEC Portaria 330/2018", "MEC Portaria 554/2019", "LGPD Art. 18"],
    latency_ms: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  });
}
