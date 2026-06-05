import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { AnaliseCard } from "@/components/ia/analise-card"
import { gerarAnalise } from "@/actions/ia"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sofia — Consultora Financeira</h1>
          <p className="text-sm text-muted-foreground">
            Sua assistente de inteligência financeira pessoal
          </p>
        </div>
        <form action={gerarAnalise as unknown as (formData: FormData) => Promise<void>}>
          <Button type="submit">
            <Sparkles className="mr-2 h-4 w-4" />
            Analisar agora
          </Button>
        </form>
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
            <p className="text-sm text-muted-foreground">Nenhum lançamento no período.</p>
          ) : (
            <div className="max-h-64 overflow-y-auto rounded-md border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 border-b bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Descrição</th>
                    <th className="px-3 py-2 text-left font-medium">Data</th>
                    <th className="px-3 py-2 text-right font-medium">Valor</th>
                    <th className="px-3 py-2 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lancamentos.map((l) => (
                    <tr key={l.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2">
                        <span className={l.tipo === "RECEITA" ? "text-green-500" : "text-red-500"}>
                          {l.tipo === "RECEITA" ? "+" : "-"}
                        </span>{" "}
                        {l.descricao}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {format(new Date(l.data), "dd/MM/yy", { locale: ptBR })}
                      </td>
                      <td className={`px-3 py-2 text-right font-medium ${l.tipo === "RECEITA" ? "text-green-500" : ""}`}>
                        {fmt(Number(l.valor))}
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
          )}
        </CardContent>
      </Card>

      {/* Análises */}
      {analises.length === 0 ? (
        <div className="rounded-lg border p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Nenhuma análise ainda. Clique em &quot;Analisar agora&quot; para começar.
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

