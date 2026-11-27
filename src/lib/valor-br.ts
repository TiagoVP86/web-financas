/**
 * Converte valor monetário escrito em extrato (padrão BR "1.234,56", com ou sem
 * "R$", sinal ou sufixo C/D) em número positivo. Feito em código, não no LLM,
 * porque o modelo erra a conversão de separadores (ex.: "11,90" → 11900).
 */
export function parseValorBR(input: unknown): number | null {
  if (typeof input === "number") {
    return Number.isFinite(input) ? Math.abs(input) : null
  }
  if (typeof input !== "string") return null

  const s = input.replace(/[^\d.,]/g, "")
  if (!/\d/.test(s)) return null

  const lastComma = s.lastIndexOf(",")
  const lastDot = s.lastIndexOf(".")
  let normalized: string

  if (lastComma >= 0 && lastDot >= 0) {
    // Separador que aparece por último é o decimal.
    normalized =
      lastComma > lastDot
        ? s.replace(/\./g, "").replace(",", ".")
        : s.replace(/,/g, "")
  } else if (lastComma >= 0) {
    normalized = s.replace(/,/g, (_, i: number) => (i === lastComma ? "." : ""))
  } else if (lastDot >= 0) {
    // Só ponto: 3 dígitos após o último ponto (ou vários pontos) = milhar, padrão BR.
    const decimals = s.length - lastDot - 1
    const dots = s.split(".").length - 1
    normalized = decimals === 3 || dots > 1 ? s.replace(/\./g, "") : s
  } else {
    normalized = s
  }

  const n = Number(normalized)
  return Number.isFinite(n) ? Math.abs(n) : null
}
