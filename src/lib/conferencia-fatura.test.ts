import { describe, expect, it } from "vitest"
import { aplicarDataFatura, conferirFatura } from "./conferencia-fatura"

// Lançamentos reais da fatura XP venc. 20/01/2026 (total R$ 846,08, anterior R$ 2.523,42)
const D = (valor: number) => ({ valor, tipo: "DESPESA" as const })
const R = (valor: number) => ({ valor, tipo: "RECEITA" as const })
const faturaXP = [
  ...Array.from({ length: 10 }, () => R(11.9)), // AMAZON MUSIC estornos
  D(42.9), D(36.23), D(102.37), D(35), D(39.9), // compras
  D(15.82), // IOF
  R(752.26), // Inclusão de pagamento
  R(1771.16), // Crédito de refinanciamento
  D(692.86), // Parcelamento de fatura 1/3
]

describe("conferirFatura", () => {
  it("fatura XP completa confere", () => {
    const c = conferirFatura({ totalFatura: 846.08, saldoAnterior: 2523.42, vencimento: "2026-01-20" }, faturaXP)
    expect(c.despesas).toBe(965.08)
    expect(c.creditos).toBe(2642.42)
    expect(c.calculado).toBe(846.08)
    expect(c.diferenca).toBe(0)
    expect(c.confere).toBe(true)
  })

  it("lançamento faltando aparece na diferença", () => {
    const semApple = faturaXP.filter((t) => t.valor !== 39.9)
    const c = conferirFatura({ totalFatura: 846.08, saldoAnterior: 2523.42, vencimento: "2026-01-20" }, semApple)
    expect(c.confere).toBe(false)
    expect(c.diferenca).toBe(39.9)
  })
})

describe("aplicarDataFatura", () => {
  it("move para o vencimento e guarda a data da compra na descrição", () => {
    const r = aplicarDataFatura(
      [
        { descricao: "PRODUTOS GLOBO - Parcela 6/12", data: "2025-07-26" },
        { descricao: "SEM DATA", data: null },
        { descricao: "NO DIA", data: "2026-01-20" },
      ],
      "2026-01-20"
    )
    expect(r).toEqual([
      { descricao: "PRODUTOS GLOBO - Parcela 6/12 (compra 26/07/25)", data: "2026-01-20" },
      { descricao: "SEM DATA", data: "2026-01-20" },
      { descricao: "NO DIA", data: "2026-01-20" },
    ])
  })
})
