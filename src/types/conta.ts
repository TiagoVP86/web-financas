export type TipoConta = "CORRENTE" | "POUPANCA" | "INVESTIMENTO" | "CARTAO" | "DINHEIRO"

export type ContaItem = {
  id: string
  nome: string
  tipo: TipoConta
  saldoInicial: number
  cor: string
  saldo: number         // computed: saldoInicial + receitas - despesas
  totalLancamentos: number
  createdAt: string
}

export const TIPO_CONTA_LABELS: Record<TipoConta, string> = {
  CORRENTE: "Conta Corrente",
  POUPANCA: "Poupança",
  INVESTIMENTO: "Investimento",
  CARTAO: "Cartão de Crédito",
  DINHEIRO: "Dinheiro",
}

export const COR_PRESETS = [
  "#059669", // emerald
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#14b8a6", // teal
]
