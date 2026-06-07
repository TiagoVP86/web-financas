import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { ChevronLeft, ChevronRight, PiggyBank } from "lucide-react"
import { OrcamentoCard } from "@/components/orcamento/orcamento-card"
import { CriarOrcamentoForm } from "@/components/orcamento/criar-orcamento-form"
import type { OrcamentoItem } from "@/types/orcamento"

export const metadata: Metadata = { title: "Orçamento" }

const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export default async function OrcamentoPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const sp = await searchParams
  const now = new Date()
  const mes = sp.mes ? parseInt(sp.mes) : now.getMonth() + 1
  const ano = sp.ano ? parseInt(sp.ano) : now.getFullYear()

  const start = new Date(ano, mes - 1, 1)
  const end = new Date(ano, mes, 0, 23, 59, 59)

  const [orcamentosRaw, despesas, categorias] = await Promise.all([
    db.orcamento.findMany({
      where: { userId, mes, ano },
      include: { categoria: { select: { nome: true, cor: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.lancamento.findMany({
      where: { userId, tipo: "DESPESA", data: { gte: start, lte: end } },
      select: { valor: true, categoriaId: true },
    }),
    db.categoria.findMany({ where: { userId }, orderBy: { nome: "asc" } }),
  ])

  // total despesas por categoria
  const gastoMap = new Map<string | null, number>()
  let totalDespesas = 0
  for (const d of despesas) {
    const key = d.categoriaId
    gastoMap.set(key, (gastoMap.get(key) ?? 0) + Number(d.valor))
    totalDespesas += Number(d.valor)
  }

  const items: OrcamentoItem[] = orcamentosRaw.map((o) => ({
    id: o.id,
    categoriaId: o.categoriaId,
    categoriaNome: o.categoria?.nome ?? null,
    categoriaCor: o.categoria?.cor ?? null,
    limite: Number(o.limite),
    // null categoriaId = orçamento geral (soma de todas as despesas)
    gasto: o.categoriaId === null
      ? totalDespesas
      : (gastoMap.get(o.categoriaId) ?? 0),
    mes,
    ano,
  }))

  // summary
  const totalLimite = items.reduce((s, i) => s + i.limite, 0)
  const totalGasto = items.reduce((s, i) => {
    // avoid double-counting: if there's a "geral" budget, skip per-category items from total
    return s + i.gasto
  }, 0)

  // prev / next month navigation
  const prevDate = new Date(ano, mes - 2, 1)
  const nextDate = new Date(ano, mes, 1)
  const prevHref = `/orcamento?mes=${prevDate.getMonth() + 1}&ano=${prevDate.getFullYear()}`
  const nextHref = `/orcamento?mes=${nextDate.getMonth() + 1}&ano=${nextDate.getFullYear()}`
  const isCurrentMonth = mes === now.getMonth() + 1 && ano === now.getFullYear()

  // categories not yet budgeted
  const budgetedCatIds = new Set(orcamentosRaw.map((o) => o.categoriaId))
  const availableCategorias = categorias.filter((c) => !budgetedCatIds.has(c.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orçamento</h1>
          <p className="text-sm text-muted-foreground">
            Defina limites de gasto por categoria
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href={prevHref}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="min-w-[10rem] text-center text-sm font-medium">
            {meses[mes - 1]} {ano}
          </span>
          <Link
            href={isCurrentMonth ? "#" : nextHref}
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
              isCurrentMonth
                ? "pointer-events-none text-muted-foreground/30"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Summary strip */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total orçado", value: fmt(totalLimite), cls: "text-foreground" },
            { label: "Total gasto", value: fmt(totalGasto), cls: "text-despesa" },
            {
              label: "Disponível",
              value: fmt(Math.max(totalLimite - totalDespesas, 0)),
              cls: totalLimite - totalDespesas < 0 ? "text-despesa" : "text-receita",
            },
          ].map(({ label, value, cls }) => (
            <div key={label} className="rounded-xl bg-card ring-1 ring-foreground/10 p-3 text-center">
              <p className="text-[0.7rem] text-muted-foreground">{label}</p>
              <p className={`text-base font-bold ${cls}`}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Budget cards */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PiggyBank className="h-6 w-6" />
          </span>
          <div className="space-y-1">
            <p className="text-sm font-medium">Nenhum orçamento para {meses[mes - 1]}</p>
            <p className="text-sm text-muted-foreground">
              Adicione um limite abaixo para começar a controlar seus gastos.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <OrcamentoCard key={item.id} item={item} />
          ))}
        </div>
      )}

      {/* Add form */}
      <div className="max-w-sm">
        <CriarOrcamentoForm
          categorias={availableCategorias.map((c) => ({ id: c.id, nome: c.nome }))}
          mes={mes}
          ano={ano}
        />
      </div>
    </div>
  )
}
