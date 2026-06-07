import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import type { CriarParcelamentoBody } from "@/types/parcelamento"

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const parcelamentos = await db.parcelamento.findMany({
    where: { userId },
    include: {
      categoria: { select: { nome: true, cor: true } },
      lancamentos: { select: { status: true, data: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(
    parcelamentos.map((p) => {
      const pagas = p.lancamentos.filter(
        (l) => l.status === "PAGO" || l.status === "REALIZADO"
      ).length
      const pendentes = p.lancamentos.filter(
        (l) => l.status === "PENDENTE" || l.status === "VENCIDO"
      )
      pendentes.sort((a, b) => a.data.getTime() - b.data.getTime())
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
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const body: CriarParcelamentoBody = await req.json()
  const { descricao, valorTotal, numeroParcelas, dataInicio, categoriaId } = body

  if (!descricao?.trim()) return NextResponse.json({ error: "Descrição obrigatória" }, { status: 400 })
  if (!valorTotal || valorTotal <= 0) return NextResponse.json({ error: "Valor inválido" }, { status: 400 })
  if (!numeroParcelas || numeroParcelas < 2 || numeroParcelas > 360)
    return NextResponse.json({ error: "Número de parcelas inválido (2–360)" }, { status: 400 })
  if (!dataInicio) return NextResponse.json({ error: "Data inválida" }, { status: 400 })

  // Calculate installment value, last absorbs rounding
  const valorParcelaBase = Math.floor((valorTotal / numeroParcelas) * 100) / 100
  const valorUltima = Math.round((valorTotal - valorParcelaBase * (numeroParcelas - 1)) * 100) / 100

  const inicio = new Date(dataInicio)

  const parcelamento = await db.parcelamento.create({
    data: {
      userId,
      descricao: descricao.trim(),
      valorTotal,
      valorParcela: valorParcelaBase,
      numeroParcelas,
      dataInicio: inicio,
      categoriaId: categoriaId || null,
      lancamentos: {
        create: Array.from({ length: numeroParcelas }, (_, i) => ({
          userId,
          descricao: `${descricao.trim()} (${i + 1}/${numeroParcelas})`,
          valor: i === numeroParcelas - 1 ? valorUltima : valorParcelaBase,
          tipo: "DESPESA" as const,
          data: new Date(inicio.getFullYear(), inicio.getMonth() + i, inicio.getDate()),
          status: "PENDENTE" as const,
          categoriaId: categoriaId || null,
        })),
      },
    },
  })

  return NextResponse.json({ id: parcelamento.id }, { status: 201 })
}
