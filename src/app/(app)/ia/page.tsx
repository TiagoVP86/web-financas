import { cn } from "@/lib/utils"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { AnaliseCard } from "@/components/ia/analise-card"
import { AnalyzeForm } from "@/components/ia/analyze-form"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { redirect } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { subMonths, addMonths, startOfMonth } from "date-fns"

const statusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  VENCIDO: "Vencido",
  REALIZADO: "Realizado",
}
const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDENTE: "outline",
  PAGO: "default",
  VENCIDO: "destructive",
  REALIZADO: "secondary",
}

export default async function IAPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const now = new Date()
  const threeMonthsAgo = startOfMonth(subMonths(now, 2))
  const twoMonthsAhead = addMonths(now, 2)

  const [analises, lancamentos] = await Promise.all([
    db.analiseIA.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.lancamento.findMany({
      where: {
        userId,
        OR: [
          { data: { gte: threeMonthsAgo, lte: now }, status: { in: ["REALIZADO", "PAGO"] } },
          { status: { in: ["PENDENTE", "VENCIDO"] }, data: { lte: twoMonthsAhead } },
        ],
      },
      include: { categoria: true },
      orderBy: { data: "desc" },
    }),
  ])

  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="space-y-0.5">
            <h1 className="text-2xl font-bold tracking-tight">Sofia</h1>
            <p className="text-sm text-muted-foreground">
              Sua consultora de inteligência financeira pessoal
            </p>
          </div>
        </div>
        <AnalyzeForm />
      </div>

      {/* Lançamentos considerados na análise */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lançamentos analisados</CardTitle>
          <p className="text-xs text-muted-foreground">
            Histórico dos últimos 3 meses + contas pendentes/vencidas até 2 meses à frente
          </p>
        </CardHeader>
        <CardContent>
          {lancamentos.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Nenhum lançamento no período.</p>
          ) : (
            <>
              {/* Mobile: cards */}
              <div className="md:hidden max-h-64 overflow-y-auto space-y-2">
                {lancamentos.map((l) => (
                  <div key={l.id} className="rounded-lg border p-3 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm font-medium leading-snug">{l.descricao}</span>
                      <Badge variant={statusVariant[l.status] ?? "outline"} className="shrink-0 text-xs">
                        {statusLabel[l.status] ?? l.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(l.data), "dd/MM/yy", { locale: ptBR })}
                      </span>
                      <span
                        className={cn("text-sm font-bold", l.tipo === "RECEITA" ? "text-receita" : "text-despesa")}
                      >
                        {l.tipo === "RECEITA" ? "+" : "-"}
                        {fmt(Number(l.valor))}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden max-h-64 overflow-y-auto rounded-lg border md:block">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 border-b bg-muted/60 backdrop-blur">
                    <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-3 py-2 text-left font-medium">Descrição</th>
                      <th className="px-3 py-2 text-left font-medium">Data</th>
                      <th className="px-3 py-2 text-right font-medium">Valor</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lancamentos.map((l) => (
                      <tr key={l.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30">
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                                l.tipo === "RECEITA" ? "bg-receita/10 text-receita" : "bg-despesa/10 text-despesa"
                              )}
                            >
                              {l.tipo === "RECEITA" ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            </span>
                            <span className="font-medium">{l.descricao}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground tabular-nums">
                          {format(new Date(l.data), "dd/MM/yy", { locale: ptBR })}
                        </td>
                        <td className={cn("px-3 py-2 text-right font-semibold tabular-nums", l.tipo === "RECEITA" ? "text-receita" : "text-despesa")}>
                          {l.tipo === "RECEITA" ? "+" : "-"}{fmt(Number(l.valor))}
                        </td>
                        <td className="px-3 py-2">
                          <Badge variant={statusVariant[l.status] ?? "outline"}>
                            {statusLabel[l.status] ?? l.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Análises */}
      {analises.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            Nenhuma análise ainda. Clique em &quot;Analisar agora&quot; para a Sofia avaliar suas finanças.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {analises.map((a, i) => (
            <AnaliseCard key={a.id} analise={a} isLatest={i === 0} />
          ))}
        </div>
      )}
    </div>
  )
}

