import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { Landmark } from "lucide-react"
import { ContaCard } from "@/components/contas/conta-card"
import { CriarContaForm } from "@/components/contas/criar-conta-form"
import type { ContaItem } from "@/types/conta"

export const metadata: Metadata = { title: "Contas" }

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default async function ContasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const contasRaw = await db.conta.findMany({
    where: { userId },
    include: {
      lancamentos: { select: { valor: true, tipo: true } },
    },
    orderBy: { createdAt: "asc" },
  })

  const contas: ContaItem[] = contasRaw.map((c) => {
    const receitas = c.lancamentos
      .filter((l) => l.tipo === "RECEITA")
      .reduce((s, l) => s + Number(l.valor), 0)
    const despesas = c.lancamentos
      .filter((l) => l.tipo === "DESPESA")
      .reduce((s, l) => s + Number(l.valor), 0)
    return {
      id: c.id,
      nome: c.nome,
      tipo: c.tipo,
      saldoInicial: Number(c.saldoInicial),
      cor: c.cor,
      saldo: Number(c.saldoInicial) + receitas - despesas,
      totalLancamentos: c.lancamentos.length,
      createdAt: c.createdAt.toISOString(),
    }
  })

  const saldoTotal = contas.reduce((s, c) => s + c.saldo, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Contas</h1>
          <p className="text-sm text-muted-foreground">
            {contas.length} conta{contas.length !== 1 ? "s" : ""}
            {contas.length > 0 && (
              <>
                {" · saldo total: "}
                <span className={saldoTotal >= 0 ? "text-receita" : "text-despesa"}>
                  {fmt(saldoTotal)}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      {contas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Landmark className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Nenhuma conta cadastrada</p>
            <p className="text-sm text-muted-foreground">
              Adicione suas contas bancárias para organizar seus lançamentos.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {contas.map((c) => (
            <ContaCard key={c.id} conta={c} />
          ))}
        </div>
      )}

      <div className="max-w-sm">
        <CriarContaForm />
      </div>
    </div>
  )
}
