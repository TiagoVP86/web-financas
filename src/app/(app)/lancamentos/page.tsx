import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LancamentosTable } from "@/components/lancamentos/lancamentos-table"
import { NovoLancamentoModal } from "@/components/lancamentos/novo-lancamento-modal"
import { ExportButton } from "@/components/lancamentos/export-button"
import { redirect } from "next/navigation"
import { AutoSubmitForm } from "@/components/ui/auto-submit-form"
import { ChevronDown, ListFilter, Search } from "lucide-react"

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; ano?: string; tipo?: string; status?: string; categoriaId?: string; contaId?: string; busca?: string }>
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

  const where: Record<string, unknown> = {
    userId,
    data: { gte: start, lte: end },
  }
  if (sp.tipo && sp.tipo !== "todos") where.tipo = sp.tipo
  if (sp.status && sp.status !== "todos") where.status = sp.status
  if (sp.categoriaId) where.categoriaId = sp.categoriaId
  if (sp.contaId) where.contaId = sp.contaId
  if (sp.busca?.trim()) where.descricao = { contains: sp.busca.trim(), mode: "insensitive" }

  const [lancamentos, categorias, contas] = await Promise.all([
    db.lancamento.findMany({
      where,
      include: { categoria: true, conta: { select: { id: true, nome: true } } },
      orderBy: { data: "desc" },
    }),
    db.categoria.findMany({ where: { userId }, orderBy: { nome: "asc" } }),
    db.conta.findMany({ where: { userId }, orderBy: { nome: "asc" }, select: { id: true, nome: true } }),
  ])

  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  ]
  const anos = Array.from({ length: 4 }, (_, i) => now.getFullYear() - i)

  const totalReceitas = lancamentos.filter((l) => l.tipo === "RECEITA").reduce((s, l) => s + Number(l.valor), 0)
  const totalDespesas = lancamentos.filter((l) => l.tipo === "DESPESA").reduce((s, l) => s + Number(l.valor), 0)
  const saldo = totalReceitas - totalDespesas
  const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const selectClass =
    "h-9 w-full appearance-none rounded-lg border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Lançamentos</h1>
          <p className="text-sm text-muted-foreground">
            {lancamentos.length} {lancamentos.length === 1 ? "registro" : "registros"} · {meses[mes - 1]} {ano}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton
            exportUrl={`/api/export/lancamentos?mes=${mes}&ano=${ano}${sp.tipo && sp.tipo !== "todos" ? `&tipo=${sp.tipo}` : ""}${sp.status && sp.status !== "todos" ? `&status=${sp.status}` : ""}${sp.categoriaId ? `&categoriaId=${sp.categoriaId}` : ""}${sp.contaId ? `&contaId=${sp.contaId}` : ""}${sp.busca?.trim() ? `&busca=${encodeURIComponent(sp.busca.trim())}` : ""}`}
            filename={`lancamentos-${meses[mes - 1].toLowerCase()}-${ano}.csv`}
          />
          <NovoLancamentoModal categorias={categorias} contas={contas} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <span className="text-sm text-muted-foreground">Receitas</span>
          <span className="font-semibold text-receita tabular-nums">{fmt(totalReceitas)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <span className="text-sm text-muted-foreground">Despesas</span>
          <span className="font-semibold text-despesa tabular-nums">{fmt(totalDespesas)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
          <span className="text-sm text-muted-foreground">Saldo</span>
          <span className={`font-semibold tabular-nums ${saldo > 0 ? "text-receita" : saldo < 0 ? "text-despesa" : "text-foreground"}`}>{fmt(saldo)}</span>
        </div>
      </div>

      <AutoSubmitForm className="flex flex-wrap items-center gap-2 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
        <span className="flex items-center gap-1.5 pr-1 text-sm font-medium text-muted-foreground">
          <ListFilter className="h-4 w-4" />
          Filtros
        </span>
        <div className="relative">
          <select name="mes" defaultValue={mes} className={selectClass}>
            {meses.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="relative">
          <select name="ano" defaultValue={ano} className={selectClass}>
            {anos.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="relative">
          <select name="tipo" defaultValue={sp.tipo ?? "todos"} className={selectClass}>
            <option value="todos">Todos os tipos</option>
            <option value="RECEITA">Receitas</option>
            <option value="DESPESA">Despesas</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="relative">
          <select name="status" defaultValue={sp.status ?? "todos"} className={selectClass}>
            <option value="todos">Todos os status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="VENCIDO">Vencido</option>
            <option value="REALIZADO">Realizado</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="relative">
          <select name="categoriaId" defaultValue={sp.categoriaId ?? ""} className={selectClass}>
            <option value="">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        {contas.length > 0 && (
          <div className="relative">
            <select name="contaId" defaultValue={sp.contaId ?? ""} className={selectClass}>
              <option value="">Todas as contas</option>
              {contas.map((c) => (
                <option key={c.id} value={c.id}>{c.nome}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        )}
        <div className="relative ml-auto" onChange={(e) => e.stopPropagation()}>
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            name="busca"
            type="search"
            defaultValue={sp.busca ?? ""}
            placeholder="Buscar descrição…"
            className="h-9 w-48 rounded-lg border border-input bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
          />
        </div>
      </AutoSubmitForm>

      <LancamentosTable lancamentos={lancamentos.map((l) => ({ ...l, valor: Number(l.valor) }))} />
    </div>
  )
}
