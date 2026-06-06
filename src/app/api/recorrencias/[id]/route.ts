import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { AtualizarRecorrenciaBody } from "@/types/recorrencia"

const VALID_TIPOS = new Set(["RECEITA", "DESPESA"])
const VALID_FREQUENCIAS = new Set(["SEMANAL", "QUINZENAL", "MENSAL", "ANUAL"])

function validateBody(body: AtualizarRecorrenciaBody): string | null {
  if (!body.descricao?.trim()) return "descricao inválida"
  if (body.valor == null || body.valor <= 0) return "valor inválido"
  if (!VALID_TIPOS.has(body.tipo)) return "tipo inválido"
  if (!VALID_FREQUENCIAS.has(body.frequencia)) return "frequencia inválida"
  const isSemanal = body.frequencia === "SEMANAL"
  const diaOk = Number.isInteger(body.diaVencimento) &&
    (isSemanal ? body.diaVencimento >= 0 && body.diaVencimento <= 6 : body.diaVencimento >= 1 && body.diaVencimento <= 28)
  if (!diaOk) return "diaVencimento inválido"
  return null
}

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

  let body: AtualizarRecorrenciaBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const validationError = validateBody(body)
  if (validationError) return NextResponse.json({ error: validationError }, { status: 400 })

  if (body.categoriaId) {
    const cat = await db.categoria.findFirst({ where: { id: body.categoriaId, userId } })
    if (!cat) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 })
  }

  try {
    await db.recorrencia.update({
      where: { id },
      data: {
        descricao: body.descricao.trim(),
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
        where: { recorrenciaId: id, status: "PENDENTE", userId },
        data: {
          descricao: body.descricao.trim(),
          valor: body.valor,
          tipo: body.tipo,
          categoriaId: body.categoriaId ?? null,
        },
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
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

  try {
    await db.recorrencia.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
