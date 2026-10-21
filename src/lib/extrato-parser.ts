// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse") as (
  input: Buffer | { data: Uint8Array; password: string }
) => Promise<{ text: string }>
import Papa from "papaparse"
import type { TransacaoBruta } from "@/types/extrato"
import { parseOFX } from "@/lib/ofx"
import { PdfPasswordError, pdfPareceCriptografado, toPdfPasswordError } from "@/lib/pdf-password"

export type ParseResult =
  | { kind: "text"; text: string; nomeArquivo: string }
  | { kind: "structured"; transacoes: TransacaoBruta[]; nomeArquivo: string }
  | { kind: "image"; base64: string; mimeType: string; nomeArquivo: string }

export async function parseExtrato(file: File, senha?: string): Promise<ParseResult> {
  const nomeArquivo = file.name

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const buffer = Buffer.from(await file.arrayBuffer())
    try {
      const parsed = await pdfParse(senha ? { data: new Uint8Array(buffer), password: senha } : buffer)
      return { kind: "text", text: parsed.text, nomeArquivo }
    } catch (err) {
      const passwordErr = toPdfPasswordError(err)
      if (passwordErr) throw passwordErr
      if (!senha && pdfPareceCriptografado(buffer)) throw new PdfPasswordError(false)
      throw err
    }
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

function csvToText(csv: string): string {
  const parsed = Papa.parse<string[]>(csv, { skipEmptyLines: true })
  return parsed.data.map((row) => row.join(" | ")).join("\n")
}
