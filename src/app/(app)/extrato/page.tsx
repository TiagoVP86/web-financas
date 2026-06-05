import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExtratoClient } from "@/components/extrato/extrato-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Análise de Extrato</h1>
        <p className="text-muted-foreground text-sm">
          Sofia analisa seu extrato bancário e categoriza seus gastos automaticamente.
        </p>
      </div>

      <ExtratoClient />

      {historico.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Análises anteriores</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {historico.map((analise) => (
              <Card key={analise.id} className="text-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium truncate">
                    {analise.nomeArquivo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <p className="text-muted-foreground line-clamp-2">{analise.resumo}</p>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{analise._count.transacoes} transações</span>
                    <span>
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
