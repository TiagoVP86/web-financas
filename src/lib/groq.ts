import Groq from "groq-sdk"

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
