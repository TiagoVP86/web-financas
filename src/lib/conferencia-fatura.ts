import type { TransacaoBruta } from "@/types/extrato"

export interface DadosFatura {
  /** Valor total da fatura impresso no documento. */
  totalFatura: number
  /** Total da fatura anterior (saldo que entra nesta fatura). 0 se não informado. */
  saldoAnterior: number
}

export interface ConferenciaFatura extends DadosFatura {
  despesas: number
  creditos: number
  /** saldoAnterior + despesas − créditos */
  calculado: number
  /** totalFatura − calculado; 0 = todos os lançamentos foram lidos */
  diferenca: number
  confere: boolean
}

const centavos = (v: number) => Math.round(v * 100) / 100

/**
 * Confere se os lançamentos extraídos explicam o total da fatura:
 * fatura anterior + compras − créditos/pagamentos = total da fatura.
 */
export function conferirFatura(
  fatura: DadosFatura,
  transacoes: Pick<TransacaoBruta, "valor" | "tipo">[]
): ConferenciaFatura {
  const somar = (tipo: TransacaoBruta["tipo"]) =>
    transacoes.filter((t) => t.tipo === tipo).reduce((s, t) => s + t.valor, 0)

  const despesas = centavos(somar("DESPESA"))
  const creditos = centavos(somar("RECEITA"))
  const calculado = centavos(fatura.saldoAnterior + despesas - creditos)
  const diferenca = centavos(fatura.totalFatura - calculado)

  return { ...fatura, despesas, creditos, calculado, diferenca, confere: Math.abs(diferenca) < 0.01 }
}
