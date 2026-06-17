import { db } from "@/lib/db"
import { computeFingerprint, isPossibleDuplicate } from "@/lib/fingerprint"

export interface DuplicateInput {
  data: Date
  valor: number
  tipo: "RECEITA" | "DESPESA"
  descricao: string
}

export interface DuplicateMatch {
  id: string
  descricao: string
  data: string // ISO
  valor: number
}

/** Janela ±3 dias em torno de uma data. */
function janela(data: Date): { start: Date; end: Date } {
  const start = new Date(data)
  start.setDate(start.getDate() - 3)
  const end = new Date(data)
  end.setDate(end.getDate() + 3)
  return { start, end }
}

/** Duplicatas prováveis de UMA transação. Usado no lançamento manual. */
export async function findPossibleDuplicates(
  userId: string,
  input: DuplicateInput,
): Promise<DuplicateMatch[]> {
  const { start, end } = janela(input.data)
  const fingerprint = computeFingerprint(userId, input.data, input.valor, input.tipo, input.descricao)

  const candidatos = await db.lancamento.findMany({
    where: { userId, OR: [{ fingerprint }, { data: { gte: start, lte: end } }] },
    select: { id: true, descricao: true, data: true, valor: true, tipo: true, fingerprint: true },
    take: 50,
  })

  const cand = { data: input.data, valor: input.valor, tipo: input.tipo, fingerprint }
  return candidatos
    .filter((c) =>
      isPossibleDuplicate(cand, {
        data: c.data,
        valor: Number(c.valor),
        tipo: c.tipo,
        fingerprint: c.fingerprint ?? "",
      }),
    )
    .map((c) => ({ id: c.id, descricao: c.descricao, data: c.data.toISOString(), valor: Number(c.valor) }))
}

/** Marca, em lote, quais itens já têm provável duplicata. Uma query só. Usado no upload de extrato. */
export async function flagDuplicates(
  userId: string,
  itens: DuplicateInput[],
): Promise<boolean[]> {
  if (itens.length === 0) return []

  const datas = itens.map((i) => i.data.getTime())
  const minData = new Date(Math.min(...datas))
  const maxData = new Date(Math.max(...datas))
  const start = janela(minData).start
  const end = janela(maxData).end

  const existentes = await db.lancamento.findMany({
    where: { userId, data: { gte: start, lte: end } },
    select: { data: true, valor: true, tipo: true, fingerprint: true },
  })

  const existRecords = existentes.map((e) => ({
    data: e.data,
    valor: Number(e.valor),
    tipo: e.tipo,
    fingerprint: e.fingerprint ?? "",
  }))

  return itens.map((item) => {
    const fingerprint = computeFingerprint(userId, item.data, item.valor, item.tipo, item.descricao)
    const cand = { data: item.data, valor: item.valor, tipo: item.tipo, fingerprint }
    return existRecords.some((e) => isPossibleDuplicate(cand, e))
  })
}
