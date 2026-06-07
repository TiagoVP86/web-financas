import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface SummaryCardsProps {
  receitas: number
  despesas: number
  saldo: number
  aVencer: number
  mes: number
  prev?: { receitas: number; despesas: number; saldo: number }
}

const fmt = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

function pctChange(curr: number, prev: number) {
  if (prev === 0) return null
  return ((curr - prev) / Math.abs(prev)) * 100
}

interface StatCardProps {
  title: string
  value: number
  icon: LucideIcon
  iconClass: string
  valueClass?: string
  delta?: number | null
  goodWhenUp?: boolean
  hint?: string
  href?: string
}

function StatCard({ title, value, icon: Icon, iconClass, valueClass, delta, goodWhenUp = true, hint, href }: StatCardProps) {
  const up = (delta ?? 0) >= 0
  const favorable = goodWhenUp ? up : !up
  const showDelta = delta != null && Number.isFinite(delta)

  const content = (
    <Card className={cn(
      "transition-shadow duration-150",
      href && "cursor-pointer group-hover:ring-2 group-hover:ring-primary/30"
    )}>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-full", iconClass)}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
        <div className={cn("text-2xl font-bold tracking-tight tabular-nums", valueClass)}>
          {fmt(value)}
        </div>
        {showDelta ? (
          <div className="flex items-center gap-1 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                favorable ? "bg-receita/10 text-receita" : "bg-despesa/10 text-despesa"
              )}
            >
              {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(delta!).toFixed(1)}%
            </span>
            <span className="text-muted-foreground">vs mês anterior</span>
          </div>
        ) : hint ? (
          <p className="text-xs text-muted-foreground">{hint}</p>
        ) : (
          <p className="text-xs text-muted-foreground">Sem dados do mês anterior</p>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href} className="group block">{content}</Link>
  }
  return content
}

function SaldoHeroCard({
  saldo,
  receitas,
  despesas,
  delta,
  mes,
}: {
  saldo: number
  receitas: number
  despesas: number
  delta?: number | null
  mes: number
}) {
  const positive = saldo > 0
  const negative = saldo < 0
  const up = (delta ?? 0) >= 0
  const showDelta = delta != null && Number.isFinite(delta)

  return (
    <Link href={`/lancamentos?mes=${mes}`} className="group block">
      <Card className="relative overflow-hidden transition-shadow duration-150 group-hover:ring-2 group-hover:ring-primary/30">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: positive
              ? "linear-gradient(135deg, oklch(0.60 0.17 162 / 0.07) 0%, transparent 55%)"
              : negative
              ? "linear-gradient(135deg, oklch(0.55 0.246 16 / 0.07) 0%, transparent 55%)"
              : undefined,
          }}
        />
        <CardContent className="relative flex flex-wrap items-center justify-between gap-4 py-6">
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-muted-foreground">Saldo do mês</p>
            <div className={cn(
              "text-4xl font-bold tracking-tight tabular-nums",
              positive ? "text-receita" : negative ? "text-despesa" : "text-foreground"
            )}>
              {fmt(saldo)}
            </div>
            {showDelta && (
              <div className="flex items-center gap-1 text-xs">
                <span className={cn(
                  "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium",
                  up ? "bg-receita/10 text-receita" : "bg-despesa/10 text-despesa"
                )}>
                  {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(delta!).toFixed(1)}%
                </span>
                <span className="text-muted-foreground">vs mês anterior</span>
              </div>
            )}
            {!showDelta && (
              <p className="text-xs text-muted-foreground">Sem dados do mês anterior</p>
            )}
          </div>
          <div className="flex gap-8">
            <div>
              <p className="text-xs text-muted-foreground">Receitas</p>
              <p className="text-base font-semibold tabular-nums text-receita">{fmt(receitas)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Despesas</p>
              <p className="text-base font-semibold tabular-nums text-despesa">{fmt(despesas)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

export function SummaryCards({ receitas, despesas, saldo, aVencer, mes, prev }: SummaryCardsProps) {
  return (
    <div className="space-y-4">
      <SaldoHeroCard
        saldo={saldo}
        receitas={receitas}
        despesas={despesas}
        delta={prev ? pctChange(saldo, prev.saldo) : undefined}
        mes={mes}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Receitas do mês"
          value={receitas}
          icon={TrendingUp}
          iconClass="bg-receita/10 text-receita"
          valueClass="text-receita"
          delta={prev ? pctChange(receitas, prev.receitas) : undefined}
          goodWhenUp
          href={`/lancamentos?tipo=RECEITA&mes=${mes}`}
        />
        <StatCard
          title="Despesas do mês"
          value={despesas}
          icon={TrendingDown}
          iconClass="bg-despesa/10 text-despesa"
          valueClass="text-despesa"
          delta={prev ? pctChange(despesas, prev.despesas) : undefined}
          goodWhenUp={false}
          href={`/lancamentos?tipo=DESPESA&mes=${mes}`}
        />
        <StatCard
          title="A vencer (7 dias)"
          value={aVencer}
          icon={AlertCircle}
          iconClass="bg-alerta/10 text-alerta"
          valueClass="text-alerta"
          hint="Contas pendentes nos próximos 7 dias"
          href="/lancamentos?status=PENDENTE"
        />
      </div>
    </div>
  )
}
