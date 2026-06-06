import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { CriarRecorrenciaBody } from "@/types/recorrencia"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const recorrencias = await db.recorrencia.findMany({
    where: { userId: session.user.id },
    include: { categoria: { select: { nome: true, cor: true } } },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    recorrencias.map((r) => ({
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
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const body = (await req.json()) as CriarRecorrenciaBody

  if (!body.descricao || !body.valor || !body.tipo || !body.frequencia || !body.dataInicio) {
    return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
  }

  const recorrencia = await db.recorrencia.create({
    data: {
      descricao: body.descricao,
      valor: body.valor,
      tipo: body.tipo,
      frequencia: body.frequencia,
      diaVencimento: body.diaVencimento,
      mes: body.mes ?? null,
      categoriaId: body.categoriaId ?? null,
      totalParcelas: body.totalParcelas ?? null,
      proximaGeracao: new Date(body.dataInicio),
      userId,
    },
  })

  return NextResponse.json({ id: recorrencia.id }, { status: 201 })
}
