import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { parseExtrato } from "@/lib/extrato-parser"
import {
  extractTransactionsFromText,
  extractTransactionsFromImage,
  categorizeTransactions,
} from "@/lib/groq"
import type { AnaliseExtratoResponse } from "@/types/extrato"

const CATEGORY_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
]

const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "text/csv",
  "image/jpeg",
  "image/png",
  "image/webp",
])

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const userId = session.user.id

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })

  const isOFX = file.name.toLowerCase().endsWith(".ofx")
  const isCSV = file.name.toLowerCase().endsWith(".csv")
  if (!isOFX && !isCSV && !SUPPORTED_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: "Formato não suportado. Use PDF, OFX, CSV, JPG ou PNG." },
      { status: 400 }
    )
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Arquivo muito grande (máx 10MB)" }, { status: 400 })
  }

  try {
    const parseResult = await parseExtrato(file)

    let transacoesBrutas
    if (parseResult.kind === "structured") {
      transacoesBrutas = parseResult.transacoes
    } else if (parseResult.kind === "text") {
      transacoesBrutas = await extractTransactionsFromText(parseResult.text)
    } else {
      transacoesBrutas = await extractTransactionsFromImage(
        parseResult.base64,
        parseResult.mimeType
      )
    }

    if (transacoesBrutas.length === 0) {
      return NextResponse.json(
        { error: "Nenhuma transação encontrada. Verifique se o arquivo é um extrato bancário válido." },
        { status: 422 }
      )
    }

    const userCategorias = await db.categoria.findMany({
      where: { userId },
      select: { id: true, nome: true, cor: true },
    })

    const [categorizacao, blobResult] = await Promise.all([
      categorizeTransactions(
        transacoesBrutas,
        userCategorias.map((c) => ({ id: c.id, nome: c.nome }))
      ),
      put(
        `extratos/${userId}/${crypto.randomUUID()}.${file.name.split(".").pop() ?? "bin"}`,
        file,
        { access: "private" }
      ).catch(() => null),
    ])

    const analise = await db.analiseExtrato.create({
      data: {
        nomeArquivo: file.name,
        arquivoUrl: blobResult?.url ?? null,
        resumo: categorizacao.resumo,
        userId,
        transacoes: {
          create: transacoesBrutas.map((t, i) => {
            const cat = categorizacao.transacoes.find((c) => c.index === i)
            return {
              descricao: t.descricao,
              valor: t.valor,
              tipo: t.tipo,
              data: t.data ? new Date(t.data) : new Date(),
              categoriaId: cat?.categoriaId ?? null,
              categoriaNova: cat?.categoriaNova ?? null,
            }
          }),
        },
      },
      include: {
        transacoes: { include: { categoria: true } },
      },
    })

    const porCategoriaAcc: Map<string, { nome: string; cor: string; valor: number }> = new Map()
    let colorIndex = 0

    for (const t of analise.transacoes) {
      if (t.tipo !== "DESPESA") continue
      const nome = t.categoria?.nome ?? t.categoriaNova ?? "Sem categoria"
      const cor = t.categoria?.cor ?? CATEGORY_COLORS[colorIndex++ % CATEGORY_COLORS.length]
      const existing = porCategoriaAcc.get(nome)
      if (existing) {
        existing.valor += Number(t.valor)
      } else {
        porCategoriaAcc.set(nome, { nome, cor, valor: Number(t.valor) })
      }
    }

    const response: AnaliseExtratoResponse = {
      id: analise.id,
      nomeArquivo: analise.nomeArquivo,
      arquivoUrl: analise.arquivoUrl,
      resumo: analise.resumo,
      periodo: categorizacao.periodo,
      totalReceitas: categorizacao.totalReceitas,
      totalDespesas: categorizacao.totalDespesas,
      saldo: categorizacao.saldo,
      porCategoria: Array.from(porCategoriaAcc.values()),
      transacoes: analise.transacoes.map((t) => ({
        id: t.id,
        descricao: t.descricao,
        valor: Number(t.valor),
        tipo: t.tipo as "RECEITA" | "DESPESA",
        data: t.data.toISOString(),
        categoriaId: t.categoriaId,
        categoriaNome: t.categoria?.nome ?? null,
        categoriaNova: t.categoriaNova,
        importado: t.importado,
      })),
      categorias: userCategorias,
    }

    return NextResponse.json(response)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[extrato/upload]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
