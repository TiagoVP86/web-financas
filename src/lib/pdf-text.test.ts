import { describe, expect, it } from "vitest"
import { itemsToText } from "./pdf-text"

const item = (str: string, x: number, y: number, width: number) => ({
  str,
  width,
  transform: [8.25, 0, 0, 8.25, x, y],
})

describe("itemsToText", () => {
  it("separa colunas R$ e US$ de fatura (caso real XP)", () => {
    const text = itemsToText([
      item("18/02/25", 22.5, 489.4, 29.3),
      item("AMAZON MUSIC", 78.3, 489.4, 64.4),
      item("-1", 504.5, 489.4, 6.9),
      item("1,90", 511.1, 489.4, 14.4),
      item("0,00", 558.3, 489.4, 14.4),
      item("26/07/25", 22.5, 472.9, 29.3),
      item("PRODUTOS GLOBO - Parcela 6/12", 78.3, 472.9, 120),
      item("42,90", 504.5, 472.9, 20),
      item("0,00", 558.3, 472.9, 14.4),
    ])
    expect(text).toBe(
      "18/02/25 | AMAZON MUSIC | -11,90 | 0,00\n" +
        "26/07/25 | PRODUTOS GLOBO - Parcela 6/12 | 42,90 | 0,00"
    )
  })

  it("lacuna pequena vira espaço simples", () => {
    expect(itemsToText([item("Conta", 10, 100, 20), item("Luz", 32, 100, 12)])).toBe("Conta Luz")
  })
})
