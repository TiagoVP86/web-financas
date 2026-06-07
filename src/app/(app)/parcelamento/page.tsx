import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ParcelamentosClient } from "@/components/parcelamento/parcelamentos-client"
import type { ParcelamentoItem } from "@/types/parcelamento"

export const metadata: Metadata = { title: "Parcelamentos" }

export default async function ParcelamentoPage() {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")
  const userId = session.user.id

  const [parcelamentosRaw, categorias] = await Promise.all([
    db.parcelamento.findMany({
      where: { userId },
      include: {
        categoria: { select: { nome: true, cor: true } },
        lancamentos: { select: { status: true, data: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.categoria.findMany({ where: { userId }, orderBy: { nome: "asc" } }),
  ])

  const parcelamentos: ParcelamentoItem[] = parcelamentosRaw.map((p) => {
    const pagas = p.lancamentos.filter(
      (l) => l.status === "PAGO" || l.status === "REALIZADO"
    ).length
    const pendentes = p.lancamentos
      .filter((l) => l.status === "PENDENTE" || l.status === "VENCIDO")
      .sort((a, b) => a.data.getTime() - b.data.getTime())
    return {
      id: p.id,
      descricao: p.descricao,
      valorTotal: Number(p.valorTotal),
      valorParcela: Number(p.valorParcela),
      numeroParcelas: p.numeroParcelas,
      dataInicio: p.dataInicio.toISOString(),
      categoriaId: p.categoriaId,
      categoriaNome: p.categoria?.nome ?? null,
      categoriaCor: p.categoria?.cor ?? null,
      pagas,
      proximaData: pendentes[0]?.data.toISOString() ?? null,
      createdAt: p.createdAt.toISOString(),
    }
  })

  return (
    <ParcelamentosClient
      initialParcelamentos={parcelamentos}
      categorias={categorias.map((c) => ({ id: c.id, nome: c.nome }))}
    />
  )
}
