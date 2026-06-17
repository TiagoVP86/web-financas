import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { computeFingerprint } from "@/lib/fingerprint"
import type { ImportarRequestBody, ImportarResponse } from "@/types/extrato"

const CATEGORY_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const body = (await req.json()) as ImportarRequestBody
  if (!body.selecoes?.length) {
    return NextResponse.json({ error: "Nenhuma transação selecionada" }, { status: 400 })
  }

  const transacaoIds = body.selecoes.map((s) => s.transacaoId)
  const transacoes = await db.transacaoExtrato.findMany({
    where: { id: { in: transacaoIds } },
    include: { analise: { select: { userId: true } } },
  })

  if (transacoes.some((t) => t.analise.userId !== userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
  }

  // Pre-fetch valid category IDs for this user to prevent IDOR
  const requestedCatIds = body.selecoes
    .map((s) => s.categoriaId)
    .filter((id): id is string => !!id)
  const validCategorias = requestedCatIds.length
    ? await db.categoria.findMany({
        where: { id: { in: requestedCatIds }, userId },
        select: { id: true },
      })
    : []
  const validCatIds = new Set(validCategorias.map((c) => c.id))

  let imported = 0
  const errors: string[] = []

  for (const selecao of body.selecoes) {
    const transacao = transacoes.find((t) => t.id === selecao.transacaoId)
    if (!transacao) continue

    try {
      // Reject categoriaId not owned by this user
      let categoriaId =
        selecao.categoriaId && validCatIds.has(selecao.categoriaId)
          ? selecao.categoriaId
          : null

      if (!categoriaId && selecao.categoriaNova) {
        const nome = selecao.categoriaNova.trim()
        const existing = await db.categoria.findUnique({
          where: { nome_userId: { nome, userId } },
        })
        if (existing) {
          categoriaId = existing.id
        } else {
          const count = await db.categoria.count({ where: { userId } })
          const created = await db.categoria.create({
            data: {
              nome,
              cor: CATEGORY_COLORS[count % CATEGORY_COLORS.length],
              userId,
            },
          })
          categoriaId = created.id
        }
      }

      const fingerprint = computeFingerprint(
        userId,
        transacao.data,
        Number(transacao.valor),
        transacao.tipo,
        transacao.descricao,
      )

      const baseData = {
        descricao: transacao.descricao,
        valor: transacao.valor,
        tipo: transacao.tipo,
        data: transacao.data,
        status: transacao.tipo === "RECEITA" ? ("REALIZADO" as const) : ("PAGO" as const),
        categoriaId: categoriaId ?? null,
        userId,
        fingerprint,
        origem: "EXTRATO" as const,
      }

      const lancamento = transacao.fitid
        ? await db.lancamento.upsert({
            where: { userId_fitid: { userId, fitid: transacao.fitid } },
            update: {}, // já existe → reimport é no-op
            create: { ...baseData, fitid: transacao.fitid },
          })
        : await db.lancamento.create({ data: baseData })

      await db.transacaoExtrato.update({
        where: { id: transacao.id },
        data: { importado: true, lancamentoId: lancamento.id },
      })

      imported++
    } catch {
      errors.push(transacao.descricao)
    }
  }

  const response: ImportarResponse = { imported, errors }
  return NextResponse.json(response)
}
