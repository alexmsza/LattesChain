import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dggtjimmimrnvcrnumpz.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZ3RqaW1taW1ybnZjcm51bXB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgwMDU1NjEsImV4cCI6MjEwMzU4MTU2MX0.uXu_KkoeynLiMYxekrDi7Sjnekd83Y5tP9Mon4zmRjg";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Institution {
  id: string;
  name: string;
  cnpj: string;
  solana_pubkey: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Student {
  id: string;
  cpf: string;
  full_name: string;
  email: string;
  solana_wallet_custodial: string;
  bip44_index: number;
  created_at: string;
}

export interface AcademicRecord {
  id: string;
  student_id: string;
  institution_id: string;
  document_type: "DIPLOMA" | "HORAS_COMPLEMENTARES" | "CERTIFICADO_CURSO" | "HISTORICO_ESCOLAR";
  document_hash: string;
  icp_brasil_signature?: string;
  solana_tx_signature: string;
  metaplex_asset_id?: string;
  metadata: {
    course_name?: string;
    workload_hours?: number;
    completion_date?: string;
    grade?: string;
    syllabus_hash?: string;
    [key: string]: any;
  };
  issued_at: string;
  institutions?: Institution;
}
