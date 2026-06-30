import { describe, it, expect } from "vitest"
import { acumularSaldo } from "./saldo-historico-calc"

describe("acumularSaldo", () => {
  it("acumula receita menos despesa mês a mês", () => {
    const r = acumularSaldo(100, [
      { label: "jan", linha: { receitas: 50, despesas: 20 } },
      { label: "fev", linha: { receitas: 0, despesas: 30 } },
    ])
    expect(r).toEqual([
      { mes: "jan", saldo: 130 },
      { mes: "fev", saldo: 100 },
    ])
  })

  it("base negativa e lista vazia retorna vazio", () => {
    expect(acumularSaldo(-50, [])).toEqual([])
  })

  it("preserva ordem partindo de base zero", () => {
    const r = acumularSaldo(0, [
      { label: "a", linha: { receitas: 10, despesas: 0 } },
      { label: "b", linha: { receitas: 0, despesas: 0 } },
      { label: "c", linha: { receitas: 5, despesas: 15 } },
    ])
    expect(r.map((p) => p.saldo)).toEqual([10, 10, 0])
    expect(r.map((p) => p.mes)).toEqual(["a", "b", "c"])
  })
})
