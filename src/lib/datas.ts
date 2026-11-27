import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

/**
 * Formata uma data de calendário (lançamento, vencimento) gravada como
 * meia-noite UTC. `format(new Date(d))` converte para o fuso do navegador e,
 * no Brasil (UTC-3), mostra o dia anterior. Aqui usamos os campos UTC.
 */
export function formatDataCalendario(data: Date | string, pattern: string): string {
  const d = new Date(data)
  return format(new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()), pattern, {
    locale: ptBR,
  })
}

/** "20/01/2026", "20/01/26" ou "2026-01-20" → "2026-01-20"; inválido → null. */
export function parseDataBR(input: unknown): string | null {
  if (typeof input !== "string") return null
  const s = input.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(s)
  const br = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(s)
  let y: number, m: number, d: number
  if (iso) {
    ;[y, m, d] = [Number(iso[1]), Number(iso[2]), Number(iso[3])]
  } else if (br) {
    ;[d, m, y] = [Number(br[1]), Number(br[2]), Number(br[3])]
    if (y < 100) y += 2000
  } else {
    return null
  }
  const dt = new Date(Date.UTC(y, m - 1, d))
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null
  return dt.toISOString().slice(0, 10)
}
