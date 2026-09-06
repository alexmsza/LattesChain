import { issueCredentialHandler } from "@/lib/server/issueCredential";

/**
 * Compatibilidade com o prompt original (prompts/backend_serverless.md)
 * Rota canônica: POST /api/issue_certificate
 */
export async function POST(req: Request) {
  return issueCredentialHandler(req);
}
