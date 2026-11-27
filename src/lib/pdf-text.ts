/**
 * Renderizador de página para pdf-parse que preserva colunas.
 *
 * O renderizador padrão concatena itens da mesma linha sem espaço, então em
 * faturas "AMAZON MUSIC | -11,90 | 0,00" (R$ e US$) vira "AMAZON MUSIC-11,900,00"
 * e o LLM lê 11.900. Aqui usamos a posição x de cada item: lacuna grande vira
 * " | " (troca de coluna), lacuna pequena vira espaço, sem lacuna junta direto
 * (ex.: "-1" + "1,90" = "-11,90").
 */

interface TextItem {
  str: string
  width: number
  transform: number[]
}

interface PageData {
  getTextContent(opts: {
    normalizeWhitespace: boolean
    disableCombineTextItems: boolean
  }): Promise<{ items: TextItem[] }>
}

export function itemsToText(items: TextItem[]): string {
  let text = ""
  let lastY: number | undefined
  let lastEnd = 0

  for (const item of items) {
    const [a, b, , , x, y] = item.transform
    const fontSize = Math.hypot(a, b) || 8

    if (lastY === undefined) {
      text += item.str
    } else if (Math.abs(y - lastY) > 1) {
      text += "\n" + item.str
    } else {
      const gap = x - lastEnd
      const sep = gap > fontSize * 0.6 ? " | " : gap > fontSize * 0.15 ? " " : ""
      text += sep + item.str
    }
    lastY = y
    lastEnd = x + item.width
  }
  return text
}

export async function renderPageComColunas(pageData: PageData): Promise<string> {
  const content = await pageData.getTextContent({
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  })
  return itemsToText(content.items)
}
