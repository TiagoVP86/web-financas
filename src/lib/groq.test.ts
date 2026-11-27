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
