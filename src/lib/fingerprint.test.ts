import { describe, it, expect } from "vitest"
import { normalizeDescricao, computeFingerprint, isPossibleDuplicate } from "./fingerprint"

describe("normalizeDescricao", () => {
  it("remove acentos, pontuação e baixa caixa", () => {
    expect(normalizeDescricao("  Conta de Luz - CEMIG!! ")).toBe("conta de luz cemig")
  })
  it("colapsa espaços múltiplos", () => {
    expect(normalizeDescricao("PIX   ENVIADO")).toBe("pix enviado")
  })
})

describe("computeFingerprint", () => {
  const d = new Date("2026-06-10T00:00:00Z")
  it("é determinístico para mesma entrada", () => {
    const a = computeFingerprint("u1", d, 150, "DESPESA", "Conta de Luz")
    const b = computeFingerprint("u1", d, 150, "DESPESA", "CONTA DE LUZ")
    expect(a).toBe(b)
  })
  it("difere quando o valor muda", () => {
    const a = computeFingerprint("u1", d, 150, "DESPESA", "Luz")
    const b = computeFingerprint("u1", d, 151, "DESPESA", "Luz")
    expect(a).not.toBe(b)
  })
  it("difere entre usuários", () => {
    const a = computeFingerprint("u1", d, 150, "DESPESA", "Luz")
    const b = computeFingerprint("u2", d, 150, "DESPESA", "Luz")
    expect(a).not.toBe(b)
  })
})

describe("isPossibleDuplicate", () => {
  const base = { data: new Date("2026-06-10T00:00:00Z"), valor: 150, tipo: "DESPESA", fingerprint: "fp-A" }
  it("true quando fingerprint igual", () => {
    expect(isPossibleDuplicate(base, { ...base, fingerprint: "fp-A", valor: 999 })).toBe(true)
  })
  it("true para mesmo valor/tipo dentro de ±3 dias", () => {
    const other = { data: new Date("2026-06-12T00:00:00Z"), valor: 150, tipo: "DESPESA", fingerprint: "fp-B" }
    expect(isPossibleDuplicate(base, other)).toBe(true)
  })
  it("false fora da janela de 3 dias", () => {
    const other = { data: new Date("2026-06-20T00:00:00Z"), valor: 150, tipo: "DESPESA", fingerprint: "fp-B" }
    expect(isPossibleDuplicate(base, other)).toBe(false)
  })
  it("false quando valor difere e fingerprint difere", () => {
    const other = { data: new Date("2026-06-10T00:00:00Z"), valor: 200, tipo: "DESPESA", fingerprint: "fp-B" }
    expect(isPossibleDuplicate(base, other)).toBe(false)
  })
})
