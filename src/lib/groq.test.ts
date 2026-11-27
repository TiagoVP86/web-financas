import { afterEach, describe, expect, it, vi } from "vitest"
import { isRetryableModelError, TEXT_MODELS, VISION_MODELS } from "./groq"

describe("isRetryableModelError", () => {
  it("retenta model_not_found, rate limit e 5xx", () => {
    expect(isRetryableModelError({ status: 404 })).toBe(true)
    expect(isRetryableModelError({ status: 429 })).toBe(true)
    expect(isRetryableModelError({ status: 503 })).toBe(true)
  })
  it("não retenta auth nem erro sem status", () => {
    expect(isRetryableModelError({ status: 401 })).toBe(false)
    expect(isRetryableModelError(new Error("x"))).toBe(false)
  })
})

describe("cadeias de modelos", () => {
  afterEach(() => vi.unstubAllEnvs())
  it("padrão tem primário e reserva", () => {
    expect(TEXT_MODELS()).toEqual(["openai/gpt-oss-120b", "openai/gpt-oss-20b"])
  })
  it("env sobrescreve", () => {
    vi.stubEnv("GROQ_VISION_MODELS", " a/b , c/d ")
    expect(VISION_MODELS()).toEqual(["a/b", "c/d"])
  })
})

describe("normalizeExtracao", () => {
  it("lê totais da fatura com sinal e valores das transações", async () => {
    const { normalizeExtracao } = await import("./groq")
    const r = normalizeExtracao(
      JSON.stringify({
        transacoes: [
          { descricao: "AMAZON MUSIC", valor: "-11,90", tipo: "RECEITA", data: "2025-02-18" },
          { descricao: "CLUBE LIVELO", valor: "102,37", tipo: "DESPESA", data: "2025-10-02" },
        ],
        fatura: { totalFatura: "846,08", saldoAnterior: "-119,00" },
      })
    )
    expect(r.transacoes.map((t) => t.valor)).toEqual([11.9, 102.37])
    expect(r.fatura).toEqual({ totalFatura: 846.08, saldoAnterior: -119 })
  })

  it("extrato de conta: fatura null; saldoAnterior ausente vira 0", async () => {
    const { normalizeExtracao } = await import("./groq")
    expect(normalizeExtracao('{"transacoes":[],"fatura":null}').fatura).toBeNull()
    expect(normalizeExtracao('{"transacoes":[],"fatura":{"totalFatura":"10,00","saldoAnterior":null}}').fatura)
      .toEqual({ totalFatura: 10, saldoAnterior: 0 })
  })
})
