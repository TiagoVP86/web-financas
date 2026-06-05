import Groq from "groq-sdk"
import type { TransacaoBruta } from "@/types/extrato"

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export interface ExtractedBill {
  descricao: string
  valor: number | null
  data: string | null
  codigoBarras: string | null
  chavePix: string | null
}

export interface AnalysisResult {
  resumo: string
  positivos: string[]
  atencao: string[]
  sugestoes: string[]
}

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(cleaned) as T
}

export async function extractBillFromText(text: string): Promise<ExtractedBill> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `Analise este texto de documento financeiro e extraia em JSON estrito:
{
  "descricao": "tipo da conta (ex: Conta de Luz, Internet, IPTU)",
  "valor": 99.90,
  "data": "2026-06-15",
  "codigoBarras": "linha digitável completa ou null",
  "chavePix": "chave PIX ou null"
}
Para "data" use o vencimento no formato YYYY-MM-DD. Retorne APENAS o JSON.

Texto do documento:
${text.slice(0, 4000)}`,
      },
    ],
  })
  return parseJson<ExtractedBill>(completion.choices[0].message.content ?? "{}")
}

export async function analyzeFinances(data: string): Promise<AnalysisResult> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    messages: [
      {
        role: "user",
        content: `Você é um consultor financeiro pessoal objetivo e prático.
Analise os dados financeiros abaixo e responda em JSON estrito:
{
  "resumo": "parágrafo conciso (máx 3 linhas) sobre a situação financeira",
  "positivos": ["ponto 1", "ponto 2", "ponto 3"],
  "atencao": ["ponto 1", "ponto 2", "ponto 3"],
  "sugestoes": ["sugestão prática 1", "sugestão prática 2", "sugestão prática 3"]
}

Dados dos últimos 3 meses:
${data}

Retorne APENAS o JSON.`,
      },
    ],
  })
  return parseJson<AnalysisResult>(completion.choices[0].message.content ?? "{}")
}

export interface CategorizacaoResult {
  transacoes: Array<{
    index: number
    categoriaId: string | null
    categoriaNova: string | null
  }>
  resumo: string
  totalReceitas: number
  totalDespesas: number
  saldo: number
  periodo: string
}

export async function extractTransactionsFromText(
  text: string
): Promise<TransacaoBruta[]> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `Analise este extrato bancário e extraia TODAS as transações em JSON estrito:
{
  "transacoes": [
    {
      "descricao": "descrição da transação",
      "valor": 99.90,
      "tipo": "DESPESA",
      "data": "2026-03-01"
    }
  ]
}
Regras:
- "tipo": use "RECEITA" para entradas/créditos, "DESPESA" para saídas/débitos
- "valor": sempre positivo
- "data": formato YYYY-MM-DD; use null se não encontrar
- Inclua TODAS as transações visíveis no texto
Retorne APENAS o JSON.

Extrato:
${text.slice(0, 8000)}`,
      },
    ],
  })
  const result = parseJson<{ transacoes: TransacaoBruta[] }>(
    completion.choices[0].message.content ?? "{}"
  )
  return result.transacoes ?? []
}

export async function extractTransactionsFromImage(
  base64: string,
  mimeType: string
): Promise<TransacaoBruta[]> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.2-11b-vision-preview",
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${base64}` },
          } as never,
          {
            type: "text",
            text: `Extraia todas as transações do extrato bancário nesta imagem em JSON estrito:
{
  "transacoes": [
    {
      "descricao": "descrição",
      "valor": 99.90,
      "tipo": "DESPESA",
      "data": "2026-03-01"
    }
  ]
}
Regras: "tipo" RECEITA para entradas, DESPESA para saídas; "valor" sempre positivo; "data" YYYY-MM-DD ou null.
Retorne APENAS o JSON.`,
          },
        ],
      },
    ],
  })
  const result = parseJson<{ transacoes: TransacaoBruta[] }>(
    completion.choices[0].message.content ?? "{}"
  )
  return result.transacoes ?? []
}

export async function categorizeTransactions(
  transacoes: TransacaoBruta[],
  categorias: { id: string; nome: string }[]
): Promise<CategorizacaoResult> {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    messages: [
      {
        role: "user",
        content: `Você é Sofia, consultora financeira. Categorize as transações abaixo.

Categorias disponíveis (use o id quando houver match):
${JSON.stringify(categorias)}

Transações a categorizar:
${JSON.stringify(
  transacoes.map((t, i) => ({
    index: i,
    descricao: t.descricao,
    valor: t.valor,
    tipo: t.tipo,
  }))
)}

Responda em JSON estrito:
{
  "transacoes": [
    {
      "index": 0,
      "categoriaId": "id-da-categoria-existente-ou-null",
      "categoriaNova": "Nome Nova Categoria ou null"
    }
  ],
  "resumo": "Análise objetiva do período financeiro em 2-3 frases",
  "totalReceitas": 0.00,
  "totalDespesas": 0.00,
  "saldo": 0.00,
  "periodo": "descrição do período detectado (ex: março de 2026)"
}

Regras:
- Use categoriaId se a categoria existente for adequada (nunca invente um id)
- Use categoriaNova apenas se nenhuma categoria existente couber
- Nunca preencha categoriaId e categoriaNova na mesma transação
- Calcule totais somando os valores das transações por tipo
- Retorne uma entrada por transação, mantendo o index original

Retorne APENAS o JSON.`,
      },
    ],
  })
  return parseJson<CategorizacaoResult>(
    completion.choices[0].message.content ?? "{}"
  )
}
