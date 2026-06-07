export type ParcelamentoItem = {
  id: string
  descricao: string
  valorTotal: number
  valorParcela: number
  numeroParcelas: number
  dataInicio: string
  categoriaId: string | null
  categoriaNome: string | null
  categoriaCor: string | null
  pagas: number
  proximaData: string | null
  createdAt: string
}

export type CriarParcelamentoBody = {
  descricao: string
  valorTotal: number
  numeroParcelas: number
  dataInicio: string
  categoriaId?: string | null
}
