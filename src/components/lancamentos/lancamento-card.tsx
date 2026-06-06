"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Copy, Check, Trash2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { marcarComoPago, deletarLancamento } from "@/actions/lancamentos"
import Link from "next/link"
import { StatusBadge } from "./status-badge"
import type { LancamentoRow } from "./lancamentos-table"

interface LancamentoCardProps {
  lancamento: LancamentoRow
}

export function LancamentoCard({ lancamento: l }: LancamentoCardProps) {
  const fmt = (v: unknown) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const copiar = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado!`)
  }

  return (
    <div className="rounded-lg border p-3 space-y-2">
      {/* Descrição + tipo */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-medium text-sm leading-snug">{l.descricao}</span>
        <Badge
          variant="outline"
          className={`shrink-0 text-xs ${
            l.tipo === "RECEITA"
              ? "border-receita text-receita"
              : "border-despesa text-despesa"
          }`}
        >
          {l.tipo === "RECEITA" ? "Receita" : "Despesa"}
        </Badge>
      </div>

      {/* Categoria + data */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {l.categoria ? (
            <span className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: l.categoria.cor }}
              />
              {l.categoria.nome}
            </span>
          ) : (
            "Sem categoria"
          )}
        </span>
        <span>{format(new Date(l.data), "dd/MM/yyyy", { locale: ptBR })}</span>
      </div>

      {/* Status + valor */}
      <div className="flex items-center justify-between">
        <StatusBadge status={l.status} />
        <span
          className={`font-bold text-sm ${
            l.tipo === "RECEITA" ? "text-receita" : "text-despesa"
          }`}
        >
          {l.tipo === "RECEITA" ? "+" : "-"}
          {fmt(l.valor)}
        </span>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 border-t pt-2">
        {l.codigoBarras && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copiar(l.codigoBarras!, "Código de barras")}
            className="h-8 px-2 text-xs"
          >
            <Copy className="mr-1 h-3 w-3" />
            Cód. Barras
          </Button>
        )}
        {l.chavePix && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copiar(l.chavePix!, "Chave PIX")}
            className="h-8 px-2 text-xs"
          >
            <Copy className="mr-1 h-3 w-3" />
            PIX
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          {(l.status === "PENDENTE" || l.status === "VENCIDO") && (
            <form action={marcarComoPago.bind(null, l.id)}>
              <Button variant="ghost" size="sm" type="submit" className="h-8 px-2 text-xs">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                Pagar
              </Button>
            </form>
          )}
          <Link
            href={`/lancamentos/${l.id}/editar`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <form action={deletarLancamento.bind(null, l.id)}>
            <Button variant="ghost" size="icon" type="submit" className="h-8 w-8">
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
