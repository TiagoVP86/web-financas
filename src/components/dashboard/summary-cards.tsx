import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react"

interface SummaryCardsProps {
  receitas: number
  despesas: number
  saldo: number
  aVencer: number
}

export function SummaryCards({ receitas, despesas, saldo, aVencer }: SummaryCardsProps) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Receitas do mês</CardTitle>
          <TrendingUp className="h-4 w-4 text-receita" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-receita">{fmt(receitas)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Despesas do mês</CardTitle>
          <TrendingDown className="h-4 w-4 text-despesa" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-despesa">{fmt(despesas)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
          <Wallet className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${saldo >= 0 ? "text-primary" : "text-despesa"}`}>
            {fmt(saldo)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">A vencer (7 dias)</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-500">{fmt(aVencer)}</div>
        </CardContent>
      </Card>
    </div>
  )
}
