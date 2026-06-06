import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { AtualizarRecorrenciaBody } from "@/types/recorrencia"

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id
  const { id } = await params

  const existing = await db.recorrencia.findFirst({ where: { id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const body = (await req.json()) as AtualizarRecorrenciaBody

  await db.recorrencia.update({
    where: { id },
    data: {
      descricao: body.descricao,
      valor: body.valor,
      tipo: body.tipo,
      frequencia: body.frequencia,
      diaVencimento: body.diaVencimento,
      mes: body.mes ?? null,
      categoriaId: body.categoriaId ?? null,
      totalParcelas: body.totalParcelas ?? null,
    },
  })

  if (body.scope === "todos") {
    await db.lancamento.updateMany({
      where: { recorrenciaId: id, status: "PENDENTE" },
      data: {
        descricao: body.descricao,
        valor: body.valor,
        tipo: body.tipo,
        categoriaId: body.categoriaId ?? null,
      },
    })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id
  const { id } = await params

  const existing = await db.recorrencia.findFirst({ where: { id, userId } })
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await db.recorrencia.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
