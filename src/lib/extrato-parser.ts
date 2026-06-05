// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (buf: Buffer) => Promise<{ text: string }>
import Papa from "papaparse"
import type { TransacaoBruta } from "@/types/extrato"

export type ParseResult =
  | { kind: "text"; text: string; nomeArquivo: string }
  | { kind: "structured"; transacoes: TransacaoBruta[]; nomeArquivo: string }
  | { kind: "image"; base64: string; mimeType: string; nomeArquivo: string }

export async function parseExtrato(file: File): Promise<ParseResult> {
  const nomeArquivo = file.name

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const buffer = Buffer.from(await file.arrayBuffer())
    const parsed = await pdfParse(buffer)
    return { kind: "text", text: parsed.text, nomeArquivo }
  }

  if (file.name.toLowerCase().endsWith(".ofx") || file.type.includes("ofx")) {
    const text = await file.text()
    const transacoes = parseOFX(text)
    return { kind: "structured", transacoes, nomeArquivo }
  }

  if (file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv")) {
    const text = await file.text()
    return { kind: "text", text: csvToText(text), nomeArquivo }
  }

  if (file.type.startsWith("image/")) {
    const buffer = Buffer.from(await file.arrayBuffer())
    return {
      kind: "image",
      base64: buffer.toString("base64"),
      mimeType: file.type,
      nomeArquivo,
    }
  }

  throw new Error(`Formato não suportado: ${file.type || file.name}`)
}

function parseOFX(content: string): TransacaoBruta[] {
  const result: TransacaoBruta[] = []
  const trnRegex = /<STMTTRN>([\s\S]*?)<\/STMTTRN>/gi

  let match: RegExpExecArray | null
  while ((match = trnRegex.exec(content)) !== null) {
    const block = match[1]
    const rawDate = block.match(/<DTPOSTED>([\d]+)/i)?.[1] ?? ""
    const rawAmt = block.match(/<TRNAMT>([-\d.]+)/i)?.[1] ?? ""
    const memo =
      block.match(/<MEMO>([^\r\n<]+)/i)?.[1]?.trim() ??
      block.match(/<NAME>([^\r\n<]+)/i)?.[1]?.trim() ??
      "Transação"

    if (!rawDate || !rawAmt) continue

    const date = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`
    const rawValue = parseFloat(rawAmt)
    const valor = Math.abs(rawValue)
    const tipo: "RECEITA" | "DESPESA" = rawValue >= 0 ? "RECEITA" : "DESPESA"

    result.push({ descricao: memo, valor, tipo, data: isValidDate(date) ? date : null })
  }

  return result
}

function csvToText(csv: string): string {
  const parsed = Papa.parse<string[]>(csv, { skipEmptyLines: true })
  return parsed.data.map((row) => row.join(" | ")).join("\n")
}

function isValidDate(date: string): boolean {
  return !isNaN(Date.parse(date))
}
