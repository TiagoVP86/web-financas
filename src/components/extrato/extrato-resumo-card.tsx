import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnaliseExtratoResponse } from "@/types/extrato"

interface ExtratoResumoCardProps {
  analise: Pick<
    AnaliseExtratoResponse,
    "nomeArquivo" | "resumo" | "periodo" | "totalReceitas" | "totalDespesas" | "saldo"
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
      </CardContent>
    </Card>
  )
}
