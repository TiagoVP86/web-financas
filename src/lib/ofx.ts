import type { TransacaoBruta } from "@/types/extrato"

function isValidDate(date: string): boolean {
  return !isNaN(Date.parse(date))
}

export function parseOFX(content: string): TransacaoBruta[] {
  const result: TransacaoBruta[] = []
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi

  let match: RegExpExecArray | null
  while ((match = trnRegex.exec(content)) !== null) {
    const block = match[1]
    const rawDate = block.match(/<DTPOSTED>([\d]+)/i)?.[1] ?? ""
    const rawAmt = block.match(/<TRNAMT>([-\d.]+)/i)?.[1] ?? ""
    const fitid = block.match(/<FITID>([^\r\n<]+)/i)?.[1]?.trim() ?? null
    const memo =
      block.match(/<MEMO>([^\r\n<]+)/i)?.[1]?.trim() ??
      block.match(/<NAME>([^\r\n<]+)/i)?.[1]?.trim() ??
      "Transação"

    if (!rawDate || !rawAmt) continue

    const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
    const rawValue = parseFloat(rawAmt)
    const valor = Math.abs(rawValue)
    const tipo: "RECEITA" | "DESPESA" = rawValue >= 0 ? "RECEITA" : "DESPESA"

    result.push({ descricao: memo, valor, tipo, data: isValidDate(date) ? date : null, fitid })
  }

  return result
}
