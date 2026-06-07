import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { gerarLancamentos } from "@/lib/recorrencia"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { MonthlyChart } from "@/components/dashboard/monthly-chart"
import { PatrimonioChart } from "@/components/dashboard/patrimonio-chart"
import { UpcomingBills } from "@/components/dashboard/upcoming-bills"
import { buttonVariants } from "@/components/ui/button"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { redirect } from "next/navigation"
import { AutoSubmitForm } from "@/components/ui/auto-submit-form"
import { ChevronDown, Sparkles } from "lucide-react"

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

  await gerarLancamentos(userId)

  const sp = await searchParams
  const now = new Date()
  const mes = sp.mes ? parseInt(sp.mes) : now.getMonth() + 1
  const ano = sp.ano ? parseInt(sp.ano) : now.getFullYear()

  const monthStart = new Date(ano, mes - 1, 1)
  const monthEnd = new Date(ano, mes, 0, 23, 59, 59)
  const next7 = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const anos = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i)

  const brtHour = ((now.getUTCHours() - 3) + 24) % 24
  const greeting = brtHour < 12 ? "Bom dia" : brtHour < 18 ? "Boa tarde" : "Boa noite"
  const firstName = session.user.name?.split(" ")[0] || "bem-vindo"
  const displayDate = format(now, "EEEE, d 'de' MMMM", { locale: ptBR })
  const dateLabel = displayDate.charAt(0).toUpperCase() + displayDate.slice(1)

  const historyMonths = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, 11 - i)
    return { start: startOfMonth(d), end: endOfMonth(d), label: format(d, "MMM/yy", { locale: ptBR }) }
  })
  const historyWindowStart = historyMonths[0].start

  const [lancamentos, pendentes, monthlyRaw, contasAgg, baseLancs, historyMonthly] = await Promise.all([
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
    db.conta.aggregate({ _sum: { saldoInicial: true }, where: { userId } }),
    db.lancamento.groupBy({
      by: ["tipo"],
      where: { userId, data: { lt: historyWindowStart } },
      _sum: { valor: true },
    }),
    Promise.all(
      historyMonths.map(({ start, end }) =>
        db.lancamento.groupBy({
          by: ["tipo"],
          where: { userId, data: { gte: start, lte: end } },
          _sum: { valor: true },
        })
      )
    ),
  ])

  let runningPatrimonio =
    Number(contasAgg._sum.saldoInicial ?? 0) +
    Number(baseLancs.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0) -
    Number(baseLancs.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)

  const patrimonioData = historyMonths.map(({ label }, i) => {
    const rows = historyMonthly[i]
    runningPatrimonio +=
      Number(rows.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0) -
      Number(rows.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)
    return { mes: label, saldo: runningPatrimonio }
  })

  const receitas = lancamentos.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0)
  const despesas = lancamentos.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0)
  const aVencer = pendentes.reduce((s, l) => s + Number(l.valor), 0)

  const prevMonth = monthlyRaw.length >= 2 ? monthlyRaw[monthlyRaw.length - 2] : undefined
  const prev = prevMonth
    ? {
        receitas: prevMonth.receitas,
        despesas: prevMonth.despesas,
        saldo: prevMonth.receitas - prevMonth.despesas,
      }
    : undefined

  const selectClass =
    "h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-0.5">
          <p className="text-xs font-medium tracking-wide text-muted-foreground">{dateLabel}</p>
          <h1 className="text-2xl font-bold tracking-tight">
            {greeting}, {firstName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <AutoSubmitForm className="flex items-center gap-2" aria-label="Filtrar período">
            <div className="relative">
              <select name="mes" defaultValue={mes} className={selectClass}>
                {MESES.map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
            <div className="relative">
              <select name="ano" defaultValue={ano} className={selectClass}>
                {anos.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </AutoSubmitForm>
          <Link href="/ia" className={cn(buttonVariants({ variant: "outline" }), "gap-1.5")}>
            <Sparkles className="h-4 w-4 text-primary" />
            Analisar com IA
          </Link>
        </div>
      </div>

      <SummaryCards
        receitas={receitas}
        despesas={despesas}
        saldo={receitas - despesas}
        aVencer={aVencer}
        mes={mes}
        prev={prev}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <MonthlyChart data={monthlyRaw} />
        <UpcomingBills bills={pendentes.map((l) => ({ ...l, valor: Number(l.valor) }))} />
      </div>

      <PatrimonioChart data={patrimonioData} />
    </div>
  )
}
