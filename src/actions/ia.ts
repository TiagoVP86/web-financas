"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { analyzeFinances } from "@/lib/groq"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { subMonths, startOfMonth, addMonths } from "date-fns"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return session.user.id
}

export async function gerarAnalise() {
  const userId = await getUserId()
  const now = new Date()
  const threeMonthsAgo = startOfMonth(subMonths(now, 2))
  const twoMonthsAhead = addMonths(now, 2)

  // Histórico: últimos 3 meses (realizados/pagos)
  const historico = await db.lancamento.findMany({
    where: {
      userId,
      data: { gte: threeMonthsAgo, lte: now },
      status: { in: ["REALIZADO", "PAGO"] },
    },
    include: { categoria: true },
    orderBy: { data: "asc" },
  })

  // Pendentes: tudo que ainda não foi pago (inclui futuros)
  const pendentes = await db.lancamento.findMany({
    where: {
      userId,
      status: { in: ["PENDENTE", "VENCIDO"] },
      data: { lte: twoMonthsAhead },
    },
    include: { categoria: true },
    orderBy: { data: "asc" },
  })

  if (historico.length === 0 && pendentes.length === 0) {
    return { error: "Sem lançamentos para analisar." }
  }

  const totalReceitas = historico.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0)
  const totalDespesasPagas = historico.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0)
  const totalPendente = pendentes.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0)
  const totalVencido = pendentes.filter((l) => l.status === "VENCIDO").reduce((s, l) => s + Number(l.valor), 0)

  const byCategoryPago = historico
    .filter((l) => l.tipo === "DESPESA")
    .reduce<Record<string, number>>((acc, l) => {
      const key = l.categoria?.nome ?? "Sem categoria"
      acc[key] = (acc[key] ?? 0) + Number(l.valor)
      return acc
    }, {})

  const byCategoryPendente = pendentes
    .filter((l) => l.tipo === "DESPESA")
    .reduce<Record<string, number>>((acc, l) => {
      const key = l.categoria?.nome ?? "Sem categoria"
      acc[key] = (acc[key] ?? 0) + Number(l.valor)
      return acc
    }, {})

  const summary = {
    periodo_historico: "últimos 3 meses",
    receitas_recebidas: totalReceitas,
    despesas_pagas: totalDespesasPagas,
    saldo_realizado: totalReceitas - totalDespesasPagas,
    despesas_pagas_por_categoria: byCategoryPago,
    contas_pendentes_total: totalPendente,
    contas_vencidas_total: totalVencido,
    contas_pendentes_por_categoria: byCategoryPendente,
    quantidade_contas_pendentes: pendentes.length,
  }

  const result = await analyzeFinances(JSON.stringify(summary, null, 2))
  await db.analiseIA.create({ data: { conteudo: JSON.stringify(result), userId } })
  revalidatePath("/ia")
  return { success: true }
}
