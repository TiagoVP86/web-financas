// src/types/recorrencia.ts

export type Frequencia = "SEMANAL" | "QUINZENAL" | "MENSAL" | "ANUAL"

export interface RecorrenciaItem {
  id: string
  descricao: string
  valor: number
  tipo: "RECEITA" | "DESPESA"
  frequencia: Frequencia
  diaVencimento: number
  mes: number | null
  categoriaId: string | null
  categoriaNome: string | null
  categoriaCor: string | null
  totalParcelas: number | null
  parcelaAtual: number
  ativa: boolean
  proximaGeracao: string // ISO string
  createdAt: string
}

export interface CriarRecorrenciaBody {
  descricao: string
  valor: number
  tipo: "RECEITA" | "DESPESA"
  frequencia: Frequencia
  diaVencimento: number
  mes?: number
  categoriaId?: string | null
  totalParcelas?: number | null
  dataInicio: string // YYYY-MM-DD
}

export interface AtualizarRecorrenciaBody extends CriarRecorrenciaBody {
  scope: "futuros" | "todos"
}

export interface GerarResponse {
  gerados: number
}
