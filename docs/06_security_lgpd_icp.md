# EduCore Protocol — Segurança, ICP-Brasil e LGPD

## 1. Compliance com LGPD (Lei nº 13.709/2018)
A imutabilidade das blockchains públicas impõe um desafio direto ao **Direito à Eliminação/Esquecimento** (Art. 18, VI da LGPD).

### Estratégia de Isolamento Criptográfico:
1. **Nenhum Dado Pessoal Sensível (PII) é gravado on-chain**:
   - Proibido gravar CPF, Nome Completo, RG ou e-mail no SPL Memo, contas de programas ou metadados de tokens.
2. **Dados On-Chain estritamente anonimizados**:
   - Apenas o `SHA-256(documento)` e a assinatura criptográfica (`icp_brasil_signature`) trafegam on-chain.
   - O hash é unidirecional; sem a posse do arquivo original off-chain, o hash é matematicamente irreversível a dados pessoais.
3. **Direito ao Esquecimento Off-Chain**:
   - Caso um aluno solicite exclusão, o registro no Supabase (`students` e `academic_records`) é anonimizado ou excluído. O hash na blockchain torna-se órfão, impossibilitando qualquer correlação com o indivíduo.

---

## 2. Validação Jurídica ICP-Brasil
- **Portarias MEC 330/2018 e 554/2019**: Diplomas digitais exigem assinatura com certificado padrão ICP-Brasil (e-CNPJ da IES).
- **Assinatura Off-Chain**: O backend gera a assinatura digital do digest SHA-256 utilizando chave privada correspondente ao e-CNPJ da instituição.
- **Auditoria Cruzada**:
  - O validador obtém a chave pública da universidade via `MasterRegistry` on-chain.
  - Verifica se a assinatura ICP-Brasil do hash corresponde à IES registrada.
