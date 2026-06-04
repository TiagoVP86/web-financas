import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { LancamentosTable } from "@/components/lancamentos/lancamentos-table"
import { redirect } from "next/navigation"

export default async function LancamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string; tipo?: string; status?: string; categoriaId?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const sp = await searchParams
  const now = new Date()

  const mes = sp.mes ? parseInt(sp.mes) : now.getMonth() + 1
  const ano = now.getFullYear()
  const start = new Date(ano, mes - 1, 1)
  const end = new Date(ano, mes, 0, 23, 59, 59)

  const where: Record<string, unknown> = {
    userId,
    data: { gte: start, lte: end },
  }
  if (sp.tipo && sp.tipo !== "todos") where.tipo = sp.tipo
  if (sp.status && sp.status !== "todos") where.status = sp.status
  if (sp.categoriaId) where.categoriaId = sp.categoriaId

  const [lancamentos, categorias] = await Promise.all([
    db.lancamento.findMany({
      where,
      include: { categoria: true },
      orderBy: { data: "desc" },
    }),
    db.categoria.findMany({ where: { userId }, orderBy: { nome: "asc" } }),
  ])

  const meses = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Lançamentos</h1>
        {/* NovoLancamentoModal will be added in Task 8 */}
      </div>

      <form className="flex flex-wrap gap-2">
        <select name="mes" defaultValue={mes} className="rounded-md border bg-background px-3 py-1.5 text-sm">
          {meses.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <select name="tipo" defaultValue={sp.tipo ?? "todos"} className="rounded-md border bg-background px-3 py-1.5 text-sm">
          <option value="todos">Todos os tipos</option>
          <option value="RECEITA">Receitas</option>
          <option value="DESPESA">Despesas</option>
        </select>
        <select name="status" defaultValue={sp.status ?? "todos"} className="rounded-md border bg-background px-3 py-1.5 text-sm">
          <option value="todos">Todos os status</option>
          <option value="PENDENTE">Pendente</option>
          <option value="PAGO">Pago</option>
          <option value="VENCIDO">Vencido</option>
          <option value="REALIZADO">Realizado</option>
        </select>
        <select name="categoriaId" defaultValue={sp.categoriaId ?? ""} className="rounded-md border bg-background px-3 py-1.5 text-sm">
          <option value="">Todas as categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nome}</option>
          ))}
        </select>
        <button type="submit" className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground">
          Filtrar
        </button>
      </form>

      <LancamentosTable lancamentos={lancamentos} />
    </div>
  )
}
