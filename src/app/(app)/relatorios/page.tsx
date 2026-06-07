import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { AutoSubmitForm } from "@/components/ui/auto-submit-form"
import { ExportButton } from "@/components/lancamentos/export-button"
import { CategoryPieChart } from "@/components/relatorios/category-pie-chart"
import { MonthlyBarChart } from "@/components/relatorios/monthly-bar-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"
import { ChevronDown } from "lucide-react"

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const sp = await searchParams
  const now = new Date()
  const currentYear = now.getFullYear()

  const mes = sp.mes ? parseInt(sp.mes) : now.getMonth() + 1
  const ano = sp.ano ? parseInt(sp.ano) : currentYear
  const anos = [currentYear, currentYear - 1, currentYear - 2]
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Relatórios</h1>
        <div className="flex items-center gap-2">
        <ExportButton
          exportUrl={`/api/export/relatorios?mes=${mes}&ano=${ano}`}
          filename={`relatorios-${meses[mes - 1].toLowerCase()}-${ano}.csv`}
        />
        <AutoSubmitForm className="flex items-center gap-2">
          <div className="relative">
            <select
              name="mes"
              defaultValue={mes}
              className="h-9 appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            >
              {meses.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <div className="relative">
            <select
              name="ano"
              defaultValue={ano}
              className="h-9 appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
            >
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </AutoSubmitForm>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryPieChart data={pieData} periodo={`${meses[mes - 1]} ${ano}`} />
        <MonthlyBarChart data={monthly} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumo por Categoria — {meses[mes - 1]} {ano}</CardTitle>
        </CardHeader>
        <CardContent>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem despesas no período.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="py-2 text-left font-medium">Categoria</th>
                    <th className="py-2 text-right font-medium">Total</th>
                    <th className="py-2 text-right font-medium">%</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const total = pieData.reduce((s, x) => s + x.valor, 0)
                    return pieData.map((c) => (
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
                    ))
                  })()}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
