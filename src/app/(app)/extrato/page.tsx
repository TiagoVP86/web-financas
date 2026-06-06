import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExtratoClient } from "@/components/extrato/extrato-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileSearch, FileText } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export const metadata: Metadata = { title: "Análise de Extrato" }

export default async function ExtratoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const historico = await db.analiseExtrato.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      nomeArquivo: true,
      resumo: true,
      createdAt: true,
      _count: { select: { transacoes: true } },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FileSearch className="h-5 w-5" />
        </span>
        <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight">Análise de Extrato</h1>
          <p className="text-sm text-muted-foreground">
            Sofia analisa seu extrato bancário e categoriza seus gastos automaticamente.
          </p>
        </div>
      </div>

      <ExtratoClient />

      {historico.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Análises anteriores</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {historico.map((analise) => (
              <Card key={analise.id} className="text-sm transition-[outline] hover:ring-2 hover:ring-primary/30">
                <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <FileText className="h-4 w-4" />
                  </span>
                  <CardTitle className="min-w-0 flex-1 truncate text-sm font-medium">
                    {analise.nomeArquivo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="line-clamp-2 text-muted-foreground">{analise.resumo}</p>
                  <div className="flex items-center justify-between border-t border-border/60 pt-2 text-xs text-muted-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
                      {analise._count.transacoes} transações
                    </span>
                    <span className="tabular-nums">
                      {format(analise.createdAt, "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
