import { createHash } from "node:crypto"

export function normalizeDescricao(descricao: string): string {
  return descricao
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ") // remove pontuação
    .replace(/\s+/g, " ") // colapsa espaços
    .trim()
}

export function computeFingerprint(
  userId: string,
  data: Date,
  valor: number,
  tipo: string,
  descricao: string,
): string {
  const dia = data.toISOString().slice(0, 10) // YYYY-MM-DD em UTC
  const valorStr = valor.toFixed(2)
  const payload = `${userId}|${dia}|${valorStr}|${tipo}|${normalizeDescricao(descricao)}`
  return createHash("sha1").update(payload).digest("hex")
}

interface DupRecord {
  data: Date
  valor: number
  tipo: string
  fingerprint: string
}

export function isPossibleDuplicate(candidate: DupRecord, existing: DupRecord): boolean {
  if (candidate.fingerprint && candidate.fingerprint === existing.fingerprint) return true
  if (candidate.tipo === existing.tipo && candidate.valor === existing.valor) {
    const diffDays = Math.abs(candidate.data.getTime() - existing.data.getTime()) / 86_400_000
    if (diffDays <= 3) return true
  }
  return false
}
