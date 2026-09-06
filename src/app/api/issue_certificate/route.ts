import { POST as issueCredentials } from "@/app/api/credentials/issue/route";
import { NextResponse } from "next/server";

/**
 * Compatibilidade com o prompt original (prompts/backend_serverless.md)
 * Rota canônica: POST /api/issue_certificate
 */
export async function POST(req: Request) {
  try {
    return await issueCredentials(req);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
