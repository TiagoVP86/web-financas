// src/types/extrato.ts
import type { ConferenciaFatura } from "@/lib/conferencia-fatura"

export interface TransacaoBruta {
  descricao: string
  valor: number
  tipo: "RECEITA" | "DESPESA"
  data: string | null // YYYY-MM-DD or null
  fitid?: string | null
}

export interface TransacaoExtratoItem {
  id: string
  descricao: string
  valor: number
  tipo: "RECEITA" | "DESPESA"
  data: string // ISO string
  categoriaId: string | null
  categoriaNome: string | null
  categoriaNova: string | null
  importado: boolean
  possivelDuplicata: boolean
}

export interface AnaliseExtratoResponse {
  id: string
  nomeArquivo: string
  arquivoUrl: string | null
  resumo: string
  periodo: string
  totalReceitas: number
  totalDespesas: number
  saldo: number
  /** Conferência contra o total impresso, só para fatura de cartão. */
  conferencia: ConferenciaFatura | null
  porCategoria: { nome: string; valor: number; cor: string }[]
  transacoes: TransacaoExtratoItem[]
  categorias: { id: string; nome: string; cor: string }[]
}

export interface SelecaoImportar {
  transacaoId: string
  categoriaId: string | null
  categoriaNova: string | null
}

export interface ImportarRequestBody {
  selecoes: SelecaoImportar[]
}

export interface ImportarResponse {
  imported: number
  errors: string[]
}
