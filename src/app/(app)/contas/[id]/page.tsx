import type { Metadata } from "next"
import { redirect, notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Building2, PiggyBank, TrendingUp, CreditCard, Banknote } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { computeSaldoHistorico } from "@/lib/saldo-historico"
import { SaldoContaChart } from "@/components/contas/saldo-conta-chart"
import { LancamentosTable } from "@/components/lancamentos/lancamentos-table"
import { Pagination } from "@/components/ui/pagination"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TIPO_CONTA_LABELS, type TipoConta } from "@/types/conta"
import { subMonths, startOfMonth, endOfMonth } from "date-fns"

export const metadata: Metadata = { title: "Conta" }

const PAGE_SIZE = 20
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

const TIPO_ICONS: Record<TipoConta, React.ElementType> = {
  CORRENTE:     Building2,
  POUPANCA:     PiggyBank,
  INVESTIMENTO: TrendingUp,
  CARTAO:       CreditCard,
  DINHEIRO:     Banknote,
}

export default async function ContaDetalhePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const { id } = await params
  const sp = await searchParams

  const conta = await db.conta.findFirst({ where: { id, userId } })
  if (!conta) notFound()

  const total = await db.lancamento.count({ where: { userId, contaId: id } })
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageRaw = sp.page ? parseInt(sp.page, 10) : 1
  const page = Number.isNaN(pageRaw) ? 1 : Math.min(Math.max(1, pageRaw), totalPages)

  const windowStart = startOfMonth(subMonths(new Date(), 11))

  const [serie, kpis12m, saldoAgg, lancamentos] = await Promise.all([
    computeSaldoHistorico(userId, { contaId: id }),
    db.lancamento.groupBy({
      by: ["tipo"],
      where: { userId, contaId: id, data: { gte: windowStart, lte: endOfMonth(new Date()) } },
      _sum: { valor: true },
    }),
    db.lancamento.groupBy({
      by: ["tipo"],
      where: { userId, contaId: id },
      _sum: { valor: true },
    }),
    db.lancamento.findMany({
      where: { userId, contaId: id },
      orderBy: { data: "desc" },
      include: { categoria: true, conta: { select: { id: true, nome: true } } },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
  ])

  const entradas12m = Number(kpis12m.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0)
  const saidas12m = Number(kpis12m.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)

  const saldoAtual =
    Number(conta.saldoInicial) +
    Number(saldoAgg.find((r) => r.tipo === "RECEITA")?._sum.valor ?? 0) -
    Number(saldoAgg.find((r) => r.tipo === "DESPESA")?._sum.valor ?? 0)

  const primeiro = serie[0]?.saldo ?? 0
  const ultimo = serie[serie.length - 1]?.saldo ?? 0
  const variacaoPct = primeiro !== 0 ? ((ultimo - primeiro) / Math.abs(primeiro)) * 100 : null

  const Icon = TIPO_ICONS[conta.tipo as TipoConta]
  const saldoClass = saldoAtual > 0 ? "text-receita" : saldoAtual < 0 ? "text-despesa" : "text-foreground"

  const rows = lancamentos.map((l) => ({ ...l, valor: Number(l.valor) }))

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/contas"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Contas
        </Link>
        <div className="flex items-center gap-3">
          <span
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white"
            style={{ backgroundColor: conta.cor }}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{conta.nome}</h1>
            <p className="text-sm text-muted-foreground">{TIPO_CONTA_LABELS[conta.tipo as TipoConta]}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <p className="text-xs text-muted-foreground">Saldo atual</p>
          <p className={`text-lg font-bold tabular-nums ${saldoClass}`}>{fmt(saldoAtual)}</p>
        </div>
        <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <p className="text-xs text-muted-foreground">Entradas (12m)</p>
          <p className="text-lg font-bold tabular-nums text-receita">{fmt(entradas12m)}</p>
        </div>
        <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <p className="text-xs text-muted-foreground">Saídas (12m)</p>
          <p className="text-lg font-bold tabular-nums text-despesa">{fmt(saidas12m)}</p>
        </div>
        <div className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <p className="text-xs text-muted-foreground">Variação (12m)</p>
          <p className={`text-lg font-bold tabular-nums ${variacaoPct == null || variacaoPct >= 0 ? "text-receita" : "text-despesa"}`}>
            {variacaoPct == null ? "—" : `${variacaoPct >= 0 ? "+" : ""}${variacaoPct.toFixed(1)}%`}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Saldo nos últimos 12 meses</CardTitle>
        </CardHeader>
        <CardContent>
          <SaldoContaChart data={serie} />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">
          Extrato {total > 0 && <span className="font-normal">· {total} lançamento{total !== 1 ? "s" : ""}</span>}
        </h2>
        <LancamentosTable lancamentos={rows} />
        <Pagination page={page} totalPages={totalPages} baseHref={`/contas/${id}`} />
      </div>
    </div>
  )
}
