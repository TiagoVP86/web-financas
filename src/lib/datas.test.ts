import { afterEach, describe, expect, it, vi } from "vitest"
import { formatDataCalendario, parseDataBR } from "./datas"

describe("formatDataCalendario", () => {
  afterEach(() => vi.unstubAllEnvs())

  it("mostra o dia gravado, sem voltar um dia no fuso do Brasil", () => {
    vi.stubEnv("TZ", "America/Sao_Paulo")
    expect(formatDataCalendario("2026-01-07T00:00:00.000Z", "dd/MM/yyyy")).toBe("07/01/2026")
    expect(formatDataCalendario(new Date("2026-01-01T00:00:00Z"), "dd/MM/yyyy")).toBe("01/01/2026")
  })
})

describe("parseDataBR", () => {
  it.each([
    ["20/01/2026", "2026-01-20"],
    ["20/01/26", "2026-01-20"],
    ["2026-01-20", "2026-01-20"],
    ["5/2/2026", "2026-02-05"],
  ])("%s → %s", (input, expected) => {
    expect(parseDataBR(input)).toBe(expected)
  })

  it("inválido vira null", () => {
    expect(parseDataBR("31/02/2026")).toBeNull()
    expect(parseDataBR("jan/2026")).toBeNull()
    expect(parseDataBR(null)).toBeNull()
  })
})
