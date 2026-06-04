import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export interface ExtractedBill {
  descricao: string
  valor: number | null
  data: string | null
  codigoBarras: string | null
  chavePix: string | null
}

const EXTRACT_PROMPT = `Analise este documento e extraia as informações em JSON estrito:
{
  "descricao": "nome/tipo da conta (ex: Conta de Luz, Internet, IPTU, Água)",
  "valor": 99.90,
  "data": "2026-06-15",
  "codigoBarras": "linha digitável completa ou null",
  "chavePix": "chave PIX ou null"
}
- Para "data" use o vencimento no formato YYYY-MM-DD
- Retorne APENAS o JSON, sem markdown, sem explicações`

export async function extractBillFromPdf(base64Pdf: string): Promise<ExtractedBill> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: "application/pdf",
        data: base64Pdf,
      },
    },
    EXTRACT_PROMPT,
  ])

  const text = result.response.text().trim()
  const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(json) as ExtractedBill
}

const ANALYSIS_PROMPT = (data: string) => `Você é um consultor financeiro pessoal objetivo e prático.
Analise os dados financeiros abaixo e responda em formato JSON estrito:
{
  "resumo": "parágrafo conciso (máx 3 linhas) sobre a situação financeira",
  "positivos": ["ponto 1", "ponto 2", "ponto 3"],
  "atencao": ["ponto 1", "ponto 2", "ponto 3"],
  "sugestoes": ["sugestão prática 1", "sugestão prática 2", "sugestão prática 3"]
}

Dados dos últimos 3 meses:
${data}

Retorne APENAS o JSON, sem markdown.`

export interface AnalysisResult {
  resumo: string
  positivos: string[]
  atencao: string[]
  sugestoes: string[]
}

export async function analyzeFinances(data: string): Promise<AnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })
  const result = await model.generateContent(ANALYSIS_PROMPT(data))
  const text = result.response.text().trim()
  const json = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
  return JSON.parse(json) as AnalysisResult
}
