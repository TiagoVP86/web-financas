import { describe, expect, it } from "vitest"
import { parseValorBR, parseValorBRComSinal } from "./valor-br"

describe("parseValorBRComSinal", () => {
  it.each([
    ["-11,90", -11.9],
    ["11,90-", -11.9],
    ["(11,90)", -11.9],
    ["R$ -2.642,42", -2642.42],
    ["2.523,42", 2523.42],
    ["R$ 846,08", 846.08],
    ["11,90 D", 11.9],
  ])("%s → %d", (input, expected) => {
    expect(parseValorBRComSinal(input)).toBeCloseTo(expected, 2)
  })

  it("number preserva sinal", () => {
    expect(parseValorBRComSinal(-5)).toBe(-5)
  })
})

describe("parseValorBR", () => {
  it.each([
    ["11,90", 11.9],
    ["R$ 11,90", 11.9],
    ["R$11,90", 11.9],
    ["-11,90", 11.9],
    ["11,90-", 11.9],
    ["11,90 D", 11.9],
    ["1.234,56", 1234.56],
    ["12.345.678,90", 12345678.9],
    ["1.000", 1000],
    ["11.900", 11900],
    ["11.90", 11.9],
    ["1,234.56", 1234.56],
    ["11,9", 11.9],
    ["100", 100],
    [" 2.500,00 C ", 2500],
  ])("%s → %d", (input, expected) => {
    expect(parseValorBR(input)).toBeCloseTo(expected, 2)
  })

  it("aceita number e devolve absoluto", () => {
    expect(parseValorBR(11.9)).toBe(11.9)
    expect(parseValorBR(-5)).toBe(5)
  })

  it("inválido vira null", () => {
    expect(parseValorBR("")).toBeNull()
    expect(parseValorBR("abc")).toBeNull()
    expect(parseValorBR(null)).toBeNull()
    expect(parseValorBR(Number.NaN)).toBeNull()
  })
})
