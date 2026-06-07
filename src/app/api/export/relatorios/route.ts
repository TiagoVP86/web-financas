import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns"
import { ptBR } from "date-fns/locale"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const sp = req.nextUrl.searchParams
  const now = new Date()
  const mes = sp.get("mes") ? parseInt(sp.get("mes")!) : now.getMonth() + 1
  const ano = sp.get("ano") ? parseInt(sp.get("ano")!) : now.getFullYear()

  const start = new Date(ano, mes - 1, 1)
  const end = new Date(ano, mes, 0, 23, 59, 59)

  const [despesasMes, monthly] = await Promise.all([
    db.lancamento.findMany({
      where: { userId, tipo: "DESPESA", data: { gte: start, lte: end } },
      include: { categoria: { select: { nome: true } } },
    }),
    Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(now, 11 - i)
        return db.lancamento
          .findMany({ where: { userId, data: { gte: startOfMonth(d), lte: endOfMonth(d) } } })
          .then((items) => ({
            label: format(d, "MMM/yyyy", { locale: ptBR }),
            receitas: items.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0),
            despesas: items.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0),
          }))
      })
    ),
  ])

  const byCategory = despesasMes.reduce<Record<string, { nome: string; valor: number }>>((acc, l) => {
    const key = l.categoriaId ?? "sem-categoria"
    const nome = l.categoria?.nome ?? "Sem categoria"
    acc[key] = { nome, valor: (acc[key]?.valor ?? 0) + Number(l.valor) }
    return acc
  }, {})
  const pieData = Object.values(byCategory).sort((a, b) => b.valor - a.valor)
  const totalDespesas = pieData.reduce((s, c) => s + c.valor, 0)

  const fmtVal = (v: number) => v.toFixed(2).replace(".", ",")
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]
  const periodoLabel = `${meses[mes - 1]}-${ano}`

  const catHeader = ["Categoria", "Total (R$)", "Percentual"]
  const catRows = pieData.map((c) => [
    `"${c.nome.replace(/"/g, '""')}"`,
    fmtVal(c.valor),
    totalDespesas > 0 ? `${((c.valor / totalDespesas) * 100).toFixed(1)}%` : "0%",
  ])

  const monthHeader = ["Mês", "Receitas (R$)", "Despesas (R$)", "Saldo (R$)"]
  const monthRows = monthly.map((m) => [
    m.label,
    fmtVal(m.receitas),
    fmtVal(m.despesas),
    fmtVal(m.receitas - m.despesas),
  ])

  const section1 = [
    [`"Despesas por Categoria — ${periodoLabel}"`],
    catHeader,
    ...catRows,
  ]
  const section2 = [
    [`"Evolução Mensal (últimos 12 meses)"`],
    monthHeader,
    ...monthRows,
  ]

  const csv = [...section1, [""], ...section2].map((r) => r.join(";")).join("\r\n")

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="relatorios-${periodoLabel}.csv"`,
    },
  })
}
