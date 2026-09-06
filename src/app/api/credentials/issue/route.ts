import { issueCredentialHandler } from "@/lib/server/issueCredential";

export async function POST(req: Request) {
  return issueCredentialHandler(req);
}
