export const PDF_SENHA_NECESSARIA = "PDF_SENHA_NECESSARIA"
export const PDF_SENHA_INCORRETA = "PDF_SENHA_INCORRETA"

export class PdfPasswordError extends Error {
  constructor(readonly incorreta: boolean) {
    super(incorreta ? "Senha do PDF incorreta." : "Este PDF é protegido por senha.")
    this.name = "PdfPasswordError"
  }

  get code() {
    return this.incorreta ? PDF_SENHA_INCORRETA : PDF_SENHA_NECESSARIA
  }
}

// pdf.js 1.x falha com "bad XRef entry" (não PasswordException) em PDFs RC4 abertos sem senha;
// o dicionário /Encrypt no trailer denuncia que o arquivo é protegido.
export function pdfPareceCriptografado(buffer: Buffer): boolean {
  return buffer.includes("/Encrypt")
}

// pdf.js rejeita com PasswordException: code 1 = senha ausente, 2 = senha errada
export function toPdfPasswordError(err: unknown): PdfPasswordError | null {
  if (typeof err !== "object" || err === null) return null
  const { name, code } = err as { name?: unknown; code?: unknown }
  if (name !== "PasswordException") return null
  return new PdfPasswordError(code === 2)
}
