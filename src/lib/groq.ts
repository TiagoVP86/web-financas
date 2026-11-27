import Groq from "groq-sdk"
import type { TransacaoBruta } from "@/types/extrato"
import { parseValorBR } from "./valor-br"

let _groq: Groq | null = null
function getGroq(): Groq {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  return _groq
}

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

// Cadeias de modelos: primário → reserva. Override via env (lista separada por vírgula)
// para trocar modelo depreciado sem novo deploy de código.
// Ver https://console.groq.com/docs/deprecations
function modelChain(envVar: string, defaults: string[]): string[] {
  const fromEnv = process.env[envVar]
    ?.split(",")
    .map((m) => m.trim())
    .filter(Boolean)
  return fromEnv && fromEnv.length > 0 ? fromEnv : defaults
}

export const TEXT_MODELS = () =>
  modelChain("GROQ_TEXT_MODELS", ["openai/gpt-oss-120b", "openai/gpt-oss-20b"])
export const FAST_MODELS = () =>
  modelChain("GROQ_FAST_MODELS", ["openai/gpt-oss-20b", "openai/gpt-oss-120b"])
export const VISION_MODELS = () =>
  modelChain("GROQ_VISION_MODELS", ["qwen/qwen3.8-27b"])

/** Erros em que vale tentar o próximo modelo da cadeia. */
export function isRetryableModelError(err: unknown): boolean {
  const status = (err as { status?: number })?.status
  if (status === undefined) return false
  return status === 404 || status === 400 || status === 429 || status >= 500
}

type CompletionParams = Omit<
  Parameters<Groq["chat"]["completions"]["create"]>[0],
  "model" | "stream"
>

async function complete(models: string[], params: CompletionParams): Promise<string> {
  let lastErr: unknown
  for (const model of models) {
    try {
      const completion = await getGroq().chat.completions.create({
        ...params,
        model,
        stream: false,
        response_format: { type: "json_object" },
      })
      return completion.choices[0]?.message.content ?? "{}"
    } catch (err) {
      lastErr = err
      if (!isRetryableModelError(err)) throw err
      console.warn(`[groq] modelo ${model} falhou, tentando reserva:`, (err as Error).message)
    }
  }
  throw lastErr
}

/** Valor vem como string do extrato; conversão BR feita em código (ver valor-br.ts). */
function normalizeTransacoes(content: string): TransacaoBruta[] {
  const result = parseJson<{ transacoes?: Array<Omit<TransacaoBruta, "valor"> & { valor: unknown }> }>(content)
  return (result.transacoes ?? []).flatMap((t) => {
    const valor = parseValorBR(t.valor)
    return valor === null || valor === 0 ? [] : [{ ...t, valor }]
  })
}

function parseJson<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(cleaned) as T
}

export async function extractBillFromText(text: string): Promise<ExtractedBill> {
  const content = await complete(FAST_MODELS(), {
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `Analise este texto de documento financeiro e extraia em JSON estrito:
{
  "descricao": "tipo da conta (ex: Conta de Luz, Internet, IPTU)",
  "valor": "99,90",
  "data": "2026-06-15",
  "codigoBarras": "linha digitável completa ou null",
  "chavePix": "chave PIX ou null"
}
Para "valor" copie o texto exatamente como aparece no documento (ex: "99,90"), sem converter separadores. Para "data" use o vencimento no formato YYYY-MM-DD. Retorne APENAS o JSON.

Texto do documento:
${text.slice(0, 4000)}`,
      },
    ],
  })
  const bill = parseJson<Omit<ExtractedBill, "valor"> & { valor: unknown }>(content)
  return { ...bill, valor: parseValorBR(bill.valor) }
}

export async function analyzeFinances(data: string): Promise<AnalysisResult> {
  const content = await complete(TEXT_MODELS(), {
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
  return parseJson<AnalysisResult>(content)
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
  const content = await complete(TEXT_MODELS(), {
    temperature: 0,
    messages: [
      {
        role: "user",
        content: `Analise este extrato bancário e extraia TODAS as transações em JSON estrito:
{
  "transacoes": [
    {
      "descricao": "descrição da transação",
      "valor": "11,90",
      "tipo": "DESPESA",
      "data": "2026-03-01"
    }
  ]
}
Regras:
- O texto pode ser extrato de conta ou fatura de cartão de crédito. Colunas de uma mesma linha vêm separadas por " | " (ex: "18/02/25 | AMAZON MUSIC | -11,90 | 0,00").
- "valor": STRING copiada exatamente como aparece na coluna em reais (R$), incluindo o sinal (ex: "-11,90", "1.234,56"); NÃO converta separadores. Ignore colunas em dólar (US$).
- "tipo": em extrato de conta, "RECEITA" para entradas/créditos e "DESPESA" para saídas/débitos. Em fatura de cartão, valores positivos são compras ("DESPESA") e valores negativos são estornos/créditos/pagamentos ("RECEITA").
- "data": formato YYYY-MM-DD (datas "DD/MM/AA" significam 20AA); use null se não encontrar
- Inclua cada linha de lançamento com data, mesmo que repetida. NÃO inclua subtotais, totais, saldos, resumo da fatura, valor do boleto, opções de parcelamento, limites nem taxas informativas.
Retorne APENAS o JSON.

Extrato:
${text.slice(0, 30000)}`,
      },
    ],
  })
  return normalizeTransacoes(content)
}

export async function extractTransactionsFromImage(
  base64: string,
  mimeType: string
): Promise<TransacaoBruta[]> {
  const content = await complete(VISION_MODELS(), {
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
      "valor": "11,90",
      "tipo": "DESPESA",
      "data": "2026-03-01"
    }
  ]
}
Regras: "tipo" RECEITA para entradas, DESPESA para saídas (em fatura de cartão: positivo = compra/DESPESA, negativo = estorno/crédito/RECEITA); use só a coluna em R$, ignore US$; não inclua subtotais, totais nem resumo; "valor" STRING copiada exatamente como aparece na imagem (ex: "11,90"), sem converter separadores; "data" YYYY-MM-DD ou null.
Retorne APENAS o JSON.`,
          },
        ],
      },
    ],
  })
  return normalizeTransacoes(content)
}

export async function categorizeTransactions(
  transacoes: TransacaoBruta[],
  categorias: { id: string; nome: string }[]
): Promise<CategorizacaoResult> {
  const content = await complete(TEXT_MODELS(), {
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
    content
  )
}
