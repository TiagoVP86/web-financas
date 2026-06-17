import { describe, it, expect } from "vitest"
import { parseOFX } from "./ofx"

const SAMPLE = `
<OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST>
<STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260610<TRNAMT>-150.00<FITID>ABC123<MEMO>CONTA LUZ</STMTTRN>
<STMTTRN><TRNTYPE>CREDIT<DTPOSTED>20260611<TRNAMT>2000.00<FITID>XYZ789<NAME>SALARIO</STMTTRN>
</BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>
`

describe("parseOFX", () => {
  it("extrai descrição, valor, tipo, data e fitid", () => {
    const r = parseOFX(SAMPLE)
    expect(r).toHaveLength(2)
    expect(r[0]).toEqual({ descricao: "CONTA LUZ", valor: 150, tipo: "DESPESA", data: "2026-06-10", fitid: "ABC123" })
    expect(r[1]).toEqual({ descricao: "SALARIO", valor: 2000, tipo: "RECEITA", data: "2026-06-11", fitid: "XYZ789" })
  })

  it("fitid é null quando ausente", () => {
    const noFit = `<STMTTRN><DTPOSTED>20260610<TRNAMT>-10.00<MEMO>X</STMTTRN>`
    expect(parseOFX(noFit)[0].fitid).toBeNull()
  })
})
