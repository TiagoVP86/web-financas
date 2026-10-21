import { describe, it, expect } from "vitest"
import {
  PdfPasswordError,
  pdfPareceCriptografado,
  toPdfPasswordError,
  PDF_SENHA_INCORRETA,
  PDF_SENHA_NECESSARIA,
} from "./pdf-password"

describe("pdfPareceCriptografado", () => {
  it("detecta /Encrypt no trailer", () => {
    const pdf = Buffer.from("%PDF-1.4\ntrailer\n<< /Root 1 0 R /Encrypt 8 0 R >>\n%%EOF")
    expect(pdfPareceCriptografado(pdf)).toBe(true)
  })

  it("PDF sem /Encrypt", () => {
    expect(pdfPareceCriptografado(Buffer.from("%PDF-1.4\ntrailer\n<< /Root 1 0 R >>\n%%EOF"))).toBe(false)
  })
})

describe("toPdfPasswordError", () => {
  it("code 1 → senha necessária", () => {
    const err = toPdfPasswordError({ name: "PasswordException", code: 1 })
    expect(err).toBeInstanceOf(PdfPasswordError)
    expect(err?.incorreta).toBe(false)
    expect(err?.code).toBe(PDF_SENHA_NECESSARIA)
  })

  it("code 2 → senha incorreta", () => {
    const err = toPdfPasswordError({ name: "PasswordException", code: 2 })
    expect(err?.incorreta).toBe(true)
    expect(err?.code).toBe(PDF_SENHA_INCORRETA)
  })

  it("ignora outros erros", () => {
    expect(toPdfPasswordError(new Error("boom"))).toBeNull()
    expect(toPdfPasswordError({ name: "InvalidPDFException" })).toBeNull()
    expect(toPdfPasswordError(null)).toBeNull()
    expect(toPdfPasswordError("PasswordException")).toBeNull()
  })
})
