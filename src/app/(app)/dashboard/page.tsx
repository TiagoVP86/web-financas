import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { UpcomingBills } from "@/components/dashboard/upcoming-bills"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"

const MESES = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const sp = await searchParams
  const now = new Date()
  const mes = sp.mes ? parseInt(sp.mes) : now.getMonth() + 1
  const ano = sp.ano ? parseInt(sp.ano) : now.getFullYear()

  const monthStart = new Date(ano, mes - 1, 1)
  const monthEnd = new Date(ano, mes, 0, 23, 59, 59)
  const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const anos = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i)

  const [lancamentos, pendentes, monthlyRaw] = await Promise.all([
    db.lancamento.findMany({
      where: { userId, data: { gte: monthStart, lte: monthEnd } },
    }),
    db.lancamento.findMany({
      where: {
        userId,
        status: { in: ["PENDENTE", "VENCIDO"] },
        data: { lte: next7 },
      },
      include: { categoria: true },
      orderBy: { data: "asc" },
      take: 5,
    }),
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(new Date(ano, mes - 1, 1), 5 - i)
        const start = startOfMonth(d)
        const end = endOfMonth(d)
        return db.lancamento
          .findMany({ where: { userId, data: { gte: start, lte: end } } })
          .then((items) => ({
            mes: format(d, "MMM", { locale: ptBR }),
            receitas: items.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0),
            despesas: items.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0),
          }))
      })
    ),
  ])

  const receitas = lancamentos.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0)
  const despesas = lancamentos.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0)
  const aVencer = pendentes.reduce((s, l) => s + Number(l.valor), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">
          Dashboard — {MESES[mes - 1]} {ano}
        </h1>
        <div className="flex items-center gap-2">
          <form className="flex items-center gap-2">
            <select
              name="mes"
              defaultValue={mes}
              className="rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              {MESES.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <select
              name="ano"
              defaultValue={ano}
              className="rounded-md border bg-background px-3 py-1.5 text-sm"
            >
              {anos.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            >
              Ver
            </button>
          </form>
          <Link href="/ia" className={cn(buttonVariants({ variant: "outline" }), "text-sm")}>
            Analisar com IA ✨
          </Link>
        </div>
      </div>

      <SummaryCards
        receitas={receitas}
        despesas={despesas}
        saldo={receitas - despesas}
        aVencer={aVencer}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyChart data={monthlyRaw} />
        <UpcomingBills bills={pendentes.map((l) => ({ ...l, valor: Number(l.valor) }))} />
      </div>
    </div>
  )
}
