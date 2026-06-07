import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const statusLabel: Record<string, string> = {
  PENDENTE: "Pendente",
  PAGO: "Pago",
  VENCIDO: "Vencido",
  REALIZADO: "Realizado",
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const userId = session.user.id

  const sp = req.nextUrl.searchParams
  const now = new Date()
  const mes = sp.get("mes") ? parseInt(sp.get("mes")!) : now.getMonth() + 1
  const ano = sp.get("ano") ? parseInt(sp.get("ano")!) : now.getFullYear()

  const start = new Date(ano, mes - 1, 1)
  const end = new Date(ano, mes, 0, 23, 59, 59)

  const where: Record<string, unknown> = { userId, data: { gte: start, lte: end } }
  const tipo = sp.get("tipo")
  const status = sp.get("status")
  const categoriaId = sp.get("categoriaId")
  const contaId = sp.get("contaId")
  if (tipo && tipo !== "todos") where.tipo = tipo
  if (status && status !== "todos") where.status = status
  if (categoriaId) where.categoriaId = categoriaId
  if (contaId) where.contaId = contaId

  const lancamentos = await db.lancamento.findMany({
    where,
    include: {
      categoria: { select: { nome: true } },
      conta: { select: { nome: true } },
    },
    orderBy: { data: "desc" },
  })

  const header = ["Data", "Descrição", "Tipo", "Valor", "Status", "Categoria", "Conta"]
  const rows = lancamentos.map((l) => [
    format(new Date(l.data), "dd/MM/yyyy", { locale: ptBR }),
    `"${l.descricao.replace(/"/g, '""')}"`,
    l.tipo === "RECEITA" ? "Receita" : "Despesa",
    Number(l.valor).toFixed(2).replace(".", ","),
    statusLabel[l.status] ?? l.status,
    l.categoria?.nome ?? "",
    l.conta?.nome ?? "",
  ])

  const csv = [header, ...rows].map((r) => r.join(";")).join("\r\n")
  const meses = ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro"]
  const filename = `lancamentos-${meses[mes - 1]}-${ano}.csv`

  return new NextResponse("﻿" + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  })
}
