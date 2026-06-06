import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { CriarRecorrenciaBody } from "@/types/recorrencia"

const VALID_TIPOS = new Set(["RECEITA", "DESPESA"])
const VALID_FREQUENCIAS = new Set(["SEMANAL", "QUINZENAL", "MENSAL", "ANUAL"])

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
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
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  let body: CriarRecorrenciaBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  if (
    !body.descricao?.trim() ||
    body.valor == null || body.valor <= 0 ||
    !VALID_TIPOS.has(body.tipo) ||
    !VALID_FREQUENCIAS.has(body.frequencia) ||
    !body.dataInicio ||
    !Number.isInteger(body.diaVencimento) ||
    (body.frequencia === "SEMANAL" ? body.diaVencimento < 0 || body.diaVencimento > 6 : body.diaVencimento < 1 || body.diaVencimento > 28)
  ) {
    return NextResponse.json({ error: "Campos inválidos" }, { status: 400 })
  }

  if (body.categoriaId) {
    const cat = await db.categoria.findFirst({ where: { id: body.categoriaId, userId } })
    if (!cat) return NextResponse.json({ error: "Categoria inválida" }, { status: 400 })
  }

  try {
    const recorrencia = await db.recorrencia.create({
      data: {
        descricao: body.descricao.trim(),
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
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
