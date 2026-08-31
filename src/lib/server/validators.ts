/**
 * Validação de documentos brasileiros — CPF e CNPJ (algoritmos oficiais de dígitos verificadores).
 * Retorna true/false; também expõe formatadores para exibição.
 */

export function validateCPF(cpf: string): boolean {
  const clean = (cpf || "").replace(/\D/g, "");
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  const digits = clean.split("").map(Number);

  // 1º dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += digits[i] * (10 - i);
  let d1 = (sum * 10) % 11;
  if (d1 === 10) d1 = 0;
  if (d1 !== digits[9]) return false;

  // 2º dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) sum += digits[i] * (11 - i);
  let d2 = (sum * 10) % 11;
  if (d2 === 10) d2 = 0;
  if (d2 !== digits[10]) return false;

  return true;
}

export function formatCPF(cpf: string): string {
  const c = (cpf || "").replace(/\D/g, "");
  return c.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

export function validateCNPJ(cnpj: string): boolean {
  const clean = (cnpj || "").replace(/\D/g, "");
  if (clean.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(clean)) return false;

  const digits = clean.split("").map(Number);

  // 1º dígito verificador
  let length = 12;
  let weights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < length; i++) sum += digits[i] * weights[i];
  let d1 = sum % 11;
  d1 = d1 < 2 ? 0 : 11 - d1;
  if (d1 !== digits[12]) return false;

  // 2º dígito verificador
  weights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) sum += digits[i] * weights[i];
  let d2 = sum % 11;
  d2 = d2 < 2 ? 0 : 11 - d2;
  if (d2 !== digits[13]) return false;

  return true;
}

export function formatCNPJ(cnpj: string): string {
  const c = (cnpj || "").replace(/\D/g, "");
  return c.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
}

/** Valida email simples (RFC-lite). */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email || "").trim());
}

/** Valida senha: mínimo 8 caracteres, ao menos 1 letra e 1 número. */
export function validatePassword(password: string): boolean {
  return (
    typeof password === "string" &&
    password.length >= 8 &&
    /[a-zA-Z]/.test(password) &&
    /\d/.test(password)
  );
}
