import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { CategoryPieChart } from "@/components/relatorios/category-pie-chart"
import { MonthlyBarChart } from "@/components/relatorios/monthly-bar-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const sp = await searchParams
  const now = new Date()

  const mes = sp.mes ? parseInt(sp.mes) : now.getMonth() + 1
  const ano = now.getFullYear()
  const start = new Date(ano, mes - 1, 1)
  const end = new Date(ano, mes, 0, 23, 59, 59)

  const [despesasMes, monthly] = await Promise.all([
    db.lancamento.findMany({
      where: {
        userId,
        tipo: "DESPESA",
        data: { gte: start, lte: end },
      },
      include: { categoria: true },
    }),
    Promise.all(
      Array.from({ length: 12 }, (_, i) => {
        const d = subMonths(now, 11 - i)
        const s = startOfMonth(d)
        const e = endOfMonth(d)
        return db.lancamento
          .findMany({
            where: { userId, data: { gte: s, lte: e } },
          })
          .then((items) => ({
            mes: format(d, "MMM", { locale: ptBR }),
            receitas: items
              .filter((l) => l.tipo === "RECEITA")
              .reduce((acc, l) => acc + Number(l.valor), 0),
            despesas: items
              .filter((l) => l.tipo === "DESPESA")
              .reduce((acc, l) => acc + Number(l.valor), 0),
          }))
      })
    ),
  ])

  const byCategory = despesasMes.reduce<
    Record<string, { nome: string; valor: number; cor: string }>
  >((acc, l) => {
    const key = l.categoriaId ?? "sem-categoria"
    const nome = l.categoria?.nome ?? "Sem categoria"
    const cor = l.categoria?.cor ?? "#94a3b8"
    acc[key] = { nome, cor, valor: (acc[key]?.valor ?? 0) + Number(l.valor) }
    return acc
  }, {})
  const pieData = Object.values(byCategory).sort((a, b) => b.valor - a.valor)

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <form>
          <select
            name="mes"
            defaultValue={mes}
            className="rounded-md border bg-background px-3 py-1.5 text-sm"
          >
            {meses.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <button
            type="submit"
            className="ml-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
          >
            Ver
          </button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryPieChart data={pieData} />
        <MonthlyBarChart data={monthly} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo por Categoria — {meses[mes - 1]}</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem despesas no período.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left font-medium">Categoria</th>
                  <th className="py-2 text-right font-medium">Total</th>
                  <th className="py-2 text-right font-medium">%</th>
                </tr>
              </thead>
              <tbody>
                {pieData.map((c) => {
                  const total = pieData.reduce((s, x) => s + x.valor, 0)
                  return (
                    <tr key={c.nome} className="border-b last:border-0">
                      <td className="py-2">
                        <span className="flex items-center gap-2">
                          <span
                            className="inline-block h-2 w-2 rounded-full"
                            style={{ background: c.cor }}
                          />
                          {c.nome}
                        </span>
                      </td>
                      <td className="py-2 text-right">{fmt(c.valor)}</td>
                      <td className="py-2 text-right text-muted-foreground">
                        {total > 0 ? ((c.valor / total) * 100).toFixed(1) : 0}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
