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

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const now = new Date()
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const [lancamentos, pendentes, monthlyRaw] = await Promise.all([
    // Cards: todos os lançamentos do mês (qualquer status)
    db.lancamento.findMany({
      where: { userId, data: { gte: monthStart, lte: monthEnd } },
    }),
    // Próximas contas: PENDENTE + VENCIDO
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
    // Gráfico: todos os lançamentos por mês
    Promise.all(
      Array.from({ length: 6 }, (_, i) => {
        const d = subMonths(now, 5 - i)
        const start = startOfMonth(d)
        const end = endOfMonth(d)
        return db.lancamento
          .findMany({
            where: { userId, data: { gte: start, lte: end } },
          })
          .then((items) => ({
            mes: format(d, "MMM", { locale: ptBR }),
            receitas: items
              .filter((l) => l.tipo === "RECEITA")
              .reduce((s, l) => s + Number(l.valor), 0),
            despesas: items
              .filter((l) => l.tipo === "DESPESA")
              .reduce((s, l) => s + Number(l.valor), 0),
          }))
      })
    ),
  ])

  const receitas = lancamentos
    .filter((l) => l.tipo === "RECEITA")
    .reduce((s, l) => s + Number(l.valor), 0)
  const despesas = lancamentos
    .filter((l) => l.tipo === "DESPESA")
    .reduce((s, l) => s + Number(l.valor), 0)
  const aVencer = pendentes.reduce((s, l) => s + Number(l.valor), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/ia" className={cn(buttonVariants({ variant: "outline" }))}>
          Analisar com IA ✨
        </Link>
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
