import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { gerarLancamentos } from "@/lib/recorrencia"
import { RecorrenciasClient } from "@/components/recorrencias/recorrencias-client"
import type { RecorrenciaItem } from "@/types/recorrencia"

export const metadata: Metadata = { title: "Recorrências" }

export default async function RecorrenciasPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  await gerarLancamentos(userId)

  const [recorrenciasRaw, categorias] = await Promise.all([
    db.recorrencia.findMany({
      where: { userId },
      include: { categoria: { select: { nome: true, cor: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.categoria.findMany({ where: { userId }, orderBy: { nome: "asc" } }),
  ])

  const recorrencias: RecorrenciaItem[] = recorrenciasRaw.map((r) => ({
    id: r.id,
    descricao: r.descricao,
    valor: Number(r.valor),
    tipo: r.tipo,
    frequencia: r.frequencia,
    diaVencimento: r.diaVencimento,
    mes: r.mes,
    categoriaId: r.categoriaId,
    categoriaNome: r.categoria?.nome ?? null,
    categoriaCor: r.categoria?.cor ?? null,
    totalParcelas: r.totalParcelas,
    parcelaAtual: r.parcelaAtual,
    ativa: r.ativa,
    proximaGeracao: r.proximaGeracao.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <RecorrenciasClient
      initialRecorrencias={recorrencias}
      categorias={categorias.map((c) => ({ id: c.id, nome: c.nome }))}
    />
  )
}
