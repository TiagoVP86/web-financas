"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

/**
 * Desfaz uma análise de extrato: remove os lançamentos criados a partir dela e
 * a própria análise (TransacaoExtrato cai em cascata). Lançamento também
 * referenciado por outra análise (reimport OFX via fitid) é preservado.
 */
export async function excluirAnaliseExtrato(
  analiseId: string
): Promise<{ ok: true; lancamentosRemovidos: number } | { ok: false; error: string }> {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) return { ok: false, error: "Não autenticado" }

  const analise = await db.analiseExtrato.findFirst({
    where: { id: analiseId, userId },
    select: { id: true, transacoes: { select: { lancamentoId: true } } },
  })
  if (!analise) return { ok: false, error: "Análise não encontrada" }

  const lancamentoIds = analise.transacoes
    .map((t) => t.lancamentoId)
    .filter((id): id is string => !!id)

  const compartilhados = lancamentoIds.length
    ? await db.transacaoExtrato.findMany({
        where: { lancamentoId: { in: lancamentoIds }, analiseId: { not: analiseId } },
        select: { lancamentoId: true },
      })
    : []
  const preservar = new Set(compartilhados.map((t) => t.lancamentoId))
  const remover = lancamentoIds.filter((id) => !preservar.has(id))

  const [removidos] = await db.$transaction([
    db.lancamento.deleteMany({
      where: { id: { in: remover }, userId, origem: "EXTRATO" },
    }),
    db.analiseExtrato.delete({ where: { id: analise.id } }),
  ])

  revalidatePath("/extrato")
  revalidatePath("/lancamentos")
  revalidatePath("/dashboard")
  return { ok: true, lancamentosRemovidos: removidos.count }
}
