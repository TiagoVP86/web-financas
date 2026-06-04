"use client"

import { StatusBadge } from "./status-badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Button } from "@/components/ui/button"
import { Copy, Check, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { marcarComoPago, deletarLancamento } from "@/actions/lancamentos"
import Link from "next/link"

type Status = "PENDENTE" | "PAGO" | "VENCIDO" | "REALIZADO"
type Tipo = "RECEITA" | "DESPESA"

interface LancamentoRow {
  id: string
  descricao: string
  valor: { toString(): string } | number | string
  tipo: Tipo
  data: Date
  status: Status
  codigoBarras: string | null
  chavePix: string | null
  categoria: { nome: string; cor: string } | null
}

interface LancamentosTableProps {
  lancamentos: LancamentoRow[]
}

export function LancamentosTable({ lancamentos }: LancamentosTableProps) {
  const fmt = (v: unknown) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const copiar = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  if (lancamentos.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-muted-foreground">
        Nenhum lançamento encontrado.
      </div>
    )
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Descrição</th>
            <th className="px-4 py-3 text-left font-medium">Categoria</th>
            <th className="px-4 py-3 text-left font-medium">Data</th>
            <th className="px-4 py-3 text-right font-medium">Valor</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3 text-right font-medium">Ações</th>
          </tr>
        </thead>
        <tbody>
          {lancamentos.map((l) => (
            <tr key={l.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className={l.tipo === "RECEITA" ? "text-green-500" : "text-red-500"}>
                    {l.tipo === "RECEITA" ? "+" : "-"}
                  </span>
                  {l.descricao}
                </div>
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {l.categoria ? (
                  <span className="flex items-center gap-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: l.categoria.cor }}
                    />
                    {l.categoria.nome}
                  </span>
                ) : "—"}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {format(new Date(l.data), "dd/MM/yyyy", { locale: ptBR })}
              </td>
              <td className={`px-4 py-3 text-right font-medium ${l.tipo === "RECEITA" ? "text-green-500" : ""}`}>
                {fmt(l.valor)}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={l.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  {l.codigoBarras && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copiar(l.codigoBarras!, "Código de barras")}
                      title="Copiar código de barras"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                  {l.chavePix && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copiar(l.chavePix!, "Chave PIX")}
                      title="Copiar PIX"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                  {(l.status === "PENDENTE" || l.status === "VENCIDO") && (
                    <form action={marcarComoPago.bind(null, l.id)}>
                      <Button variant="ghost" size="icon" title="Marcar como pago" type="submit">
                        <Check className="h-3 w-3 text-green-500" />
                      </Button>
                    </form>
                  )}
                  <Link
                    href={`/lancamentos/${l.id}/editar`}
                    title="Editar"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
                  >
                    <Pencil className="h-3 w-3" />
                  </Link>
                  <form action={deletarLancamento.bind(null, l.id)}>
                    <Button variant="ghost" size="icon" title="Excluir" type="submit">
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
