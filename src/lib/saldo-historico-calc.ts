export interface SaldoPonto {
  mes: string
  saldo: number
}

export interface LinhaMensal {
  receitas: number
  despesas: number
}

/** Acumula saldo a partir de uma base, aplicando receita−despesa de cada mês em ordem. */
export function acumularSaldo(
  base: number,
  meses: { label: string; linha: LinhaMensal }[],
): SaldoPonto[] {
  let saldo = base
  return meses.map(({ label, linha }) => {
    saldo += linha.receitas - linha.despesas
    return { mes: label, saldo }
  })
}
