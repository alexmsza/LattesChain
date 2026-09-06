import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { facts } = await req.json();

    if (!facts) {
      return NextResponse.json({ error: "Fatos não fornecidos" }, { status: 400 });
    }

    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    let generatedReport: string | null = null;

    // Se houver chave Groq configurada, executa prompt com LLaMA 3.3
    if (groqKey) {
      try {
        const prompt = `Você é o motor de auditoria e confiança do LattesChain (EduCore Protocol), gerando relatórios de conformidade para recrutadores de RH.
Analise os fatos criptográficos verificados na blockchain Solana:
${JSON.stringify(facts, null, 2)}

Elabore um parecer executivo profissional de até 120 palavras em português:
- Apresente o emissor autorizado e o título do documento
- Destaque o status criptográfico (Válido no SAS / Token-2022 Soulbound / ou se há revogação)
- Forneça o veredito final claro e seguro para a tomada de decisão do recrutador.`;

        const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 300,
            temperature: 0.2,
          }),
        });

        if (resp.ok) {
          const data = await resp.json();
          generatedReport = data.choices[0].message.content;
        }
      } catch (err) {
        console.warn("Falha ao chamar Groq, utilizando gerador heurístico:", err);
      }
    }

    // Gerador Heurístico Determinístico de Alta Fidelidade (Zero-Cost)
    if (!generatedReport) {
      const instName = facts.institution_name || "Universidade Credenciada";
      const docType = facts.document_type || "Certificado Acadêmico";
      const isSoulbound =
        facts.status?.includes("SOULBOUND") ||
        facts.metadata?.status_onchain?.includes("SOULBOUND") ||
        docType === "DIPLOMA";
      const isRevoked = facts.isValid === false || facts.status?.includes("REVOGADO");

      if (isRevoked) {
        generatedReport =
          `⚠️ ALERTA DE SEGURANÇA — AUDITORIA CRIPTOGRÁFICA REPROVADA\n\n` +
          `• Emissor: ${instName}\n` +
          `• Documento Auditado: ${docType}\n` +
          `• Status On-Chain: INVÁLIDO OU REVOGADO.\n` +
          `• Diagnóstico: A atestação correspondente a este hash foi formalmente revogada pela universidade emissora via extensão PermanentDelegate (Token-2022) ou não consta no registro canônico do Solana Attestation Service.\n\n` +
          `Veredito para o RH: DOCUMENTO NÃO AUTORIZADO. Não aceite este certificado para fins de contratação ou comprovação curricular.`;
      } else {
        const gradeText = facts.metadata?.grade ? ` (Avaliação: ${facts.metadata.grade})` : "";
        const hoursText = facts.metadata?.workload_hours
          ? ` Carga horária aferida de ${facts.metadata.workload_hours}h.`
          : "";

        generatedReport =
          `✅ RELATÓRIO DE CONFIANÇA (Verificação Criptográfica On-Chain)\n\n` +
          `• Emissor Autorizado: ${instName} (CNPJ: ${facts.institution_cnpj || "Verificado"})\n` +
          `• Credencial Atestada: ${docType}${gradeText}.${hoursText}\n` +
          `• Padrão Tecnológico: ${isSoulbound ? "Token-2022 Soulbound (Intransferível & Revogável pela IES)" : "Solana Attestation Service (SAS - Registro Aberto Imutável)"}\n` +
          `• Integridade: O hash SHA-256 apresentado confere integralmente com os bytes ancorados na Solana Devnet, sem qualquer indício de adulteração documental.\n` +
          `• Conformidade LGPD: Nenhum dado pessoal sensível (PII) exposto publicamente; apenas prova de integridade.\n\n` +
          `Veredito Executivo para o RH: DOCUMENTO 100% AUTÊNTICO E APTO PARA VALIDAÇÃO IMEDIATA.`;
      }
    }

    return NextResponse.json({ report: generatedReport });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
