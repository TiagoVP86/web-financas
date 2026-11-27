import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, TrendingDown, Minus, CircleCheck, TriangleAlert } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnaliseExtratoResponse } from "@/types/extrato"

interface ExtratoResumoCardProps {
  analise: Pick<
    AnaliseExtratoResponse,
    "nomeArquivo" | "resumo" | "periodo" | "totalReceitas" | "totalDespesas" | "saldo" | "conferencia"
  >
}

export function ExtratoResumoCard({ analise }: ExtratoResumoCardProps) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <Card className="ring-1 ring-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" />
          Sofia — {analise.periodo}
        </CardTitle>
        <p className="text-xs text-muted-foreground">{analise.nomeArquivo}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{analise.resumo}</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg ring-1 ring-foreground/10 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-receita">
              <TrendingUp className="h-3 w-3" />
              <span className="text-xs font-medium">Receitas</span>
            </div>
            <p className="mt-1 text-sm font-bold text-receita">
              {fmt(analise.totalReceitas)}
            </p>
          </div>
          <div className="rounded-lg ring-1 ring-foreground/10 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-despesa">
              <TrendingDown className="h-3 w-3" />
              <span className="text-xs font-medium">Despesas</span>
            </div>
            <p className="mt-1 text-sm font-bold text-despesa">
              {fmt(analise.totalDespesas)}
            </p>
          </div>
          <div className="rounded-lg ring-1 ring-foreground/10 p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <Minus className="h-3 w-3" />
              <span className="text-xs font-medium">Saldo</span>
            </div>
            <p className={cn("mt-1 text-sm font-bold", analise.saldo > 0 ? "text-receita" : analise.saldo < 0 ? "text-despesa" : "text-foreground")}>
              {fmt(analise.saldo)}
            </p>
          </div>
        </div>
        {analise.conferencia && <ConferenciaFaturaBox c={analise.conferencia} fmt={fmt} />}
      </CardContent>
    </Card>
  )
}

function ConferenciaFaturaBox({
  c,
  fmt,
}: {
  c: NonNullable<AnaliseExtratoResponse["conferencia"]>
  fmt: (v: number) => string
}) {
  const linhas: [string, string][] = [
    ["Fatura anterior", fmt(c.saldoAnterior)],
    ["+ Compras e débitos lidos", fmt(c.despesas)],
    ["− Créditos e pagamentos lidos", fmt(c.creditos)],
    ["= Calculado pelos lançamentos", fmt(c.calculado)],
  ]

  return (
    <section
      aria-label="Conferência da fatura"
      className={cn(
        "rounded-lg p-3 ring-1",
        c.confere ? "bg-receita/5 ring-receita/30" : "bg-despesa/5 ring-despesa/40"
      )}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">Total da fatura</h3>
        <p className="text-base font-bold tabular-nums">{fmt(c.totalFatura)}</p>
      </div>

      <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
        {linhas.map(([label, valor]) => (
          <div key={label} className="flex justify-between gap-2">
            <dt>{label}</dt>
            <dd className="tabular-nums">{valor}</dd>
          </div>
        ))}
      </dl>

      <p
        className={cn(
          "mt-3 flex items-start gap-1.5 border-t border-border/60 pt-2 text-xs font-medium",
          c.confere ? "text-receita" : "text-despesa"
        )}
      >
        {c.confere ? (
          <>
            <CircleCheck className="mt-px h-3.5 w-3.5 shrink-0" />
            Confere: todos os lançamentos da fatura foram lidos.
          </>
        ) : (
          <>
            <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" />
            Diferença de {fmt(Math.abs(c.diferenca))}: pode estar faltando ou sobrando lançamento. Confira com o PDF antes de importar.
          </>
        )}
      </p>
    </section>
  )
}
