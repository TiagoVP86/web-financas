"use server"

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { analyzeFinances } from "@/lib/groq"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { subMonths, startOfMonth } from "date-fns"

async function getUserId() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  return session.user.id
}

export async function gerarAnalise() {
  const userId = await getUserId()
  const threeMonthsAgo = startOfMonth(subMonths(new Date(), 2))

  const lancamentos = await db.lancamento.findMany({
    where: {
      userId,
      data: { gte: threeMonthsAgo },
      status: { in: ["REALIZADO", "PAGO"] },
    },
    include: { categoria: true },
    orderBy: { data: "asc" },
  })

  if (lancamentos.length === 0) {
    return { error: "Sem lançamentos nos últimos 3 meses para analisar." }
  }

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "RECEITA")
    .reduce((s, l) => s + Number(l.valor), 0)
  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "DESPESA")
    .reduce((s, l) => s + Number(l.valor), 0)

  const byCategory = lancamentos
    .filter((l) => l.tipo === "DESPESA")
    .reduce<Record<string, number>>((acc, l) => {
      const key = l.categoria?.nome ?? "Sem categoria"
      acc[key] = (acc[key] ?? 0) + Number(l.valor)
      return acc
    }, {})

  const summary = {
    periodo: "últimos 3 meses",
    totalReceitas,
    totalDespesas,
    saldo: totalReceitas - totalDespesas,
    despesasPorCategoria: byCategory,
    quantidadeLancamentos: lancamentos.length,
  }

  const result = await analyzeFinances(JSON.stringify(summary, null, 2))
  const conteudo = JSON.stringify(result)

  await db.analiseIA.create({ data: { conteudo, userId } })
  revalidatePath("/ia")
}
