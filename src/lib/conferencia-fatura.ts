import type { TransacaoBruta } from "@/types/extrato"

export interface DadosFatura {
  /** Valor total da fatura impresso no documento. */
  totalFatura: number
  /** Total da fatura anterior (saldo que entra nesta fatura). 0 se não informado. */
  saldoAnterior: number
  /** Vencimento da fatura, YYYY-MM-DD; null se não identificado. */
  vencimento: string | null
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

/**
 * Em fatura de cartão a data impressa é a da compra original (parcela 6/12 de
 * julho aparece na fatura de janeiro). Para o mês refletir o que é pago, todo
 * lançamento recebe a data de vencimento; a data da compra vai na descrição.
 */
export function aplicarDataFatura<T extends Pick<TransacaoBruta, "data" | "descricao">>(
  transacoes: T[],
  vencimento: string
): T[] {
  return transacoes.map((t) => {
    if (t.data === vencimento) return t
    const compra = t.data ? ` (compra ${t.data.slice(8, 10)}/${t.data.slice(5, 7)}/${t.data.slice(2, 4)})` : ""
    return { ...t, data: vencimento, descricao: t.descricao + compra }
  })
}
