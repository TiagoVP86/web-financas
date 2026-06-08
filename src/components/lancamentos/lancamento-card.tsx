"use client"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Copy, Check, Trash2, Pencil, ArrowUpRight, ArrowDownRight, Landmark } from "lucide-react"
import { toast } from "sonner"
import { marcarComoPago, deletarLancamento } from "@/actions/lancamentos"
import Link from "next/link"
import { StatusBadge } from "./status-badge"
import type { LancamentoRow } from "./lancamentos-table"
import { CategoryIcon } from "@/components/ui/category-icon"

interface LancamentoCardProps {
  lancamento: LancamentoRow
}

export function LancamentoCard({ lancamento: l }: LancamentoCardProps) {
  const fmt = (v: unknown) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const copiar = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copiado!`))
      .catch(() => toast.error("Não foi possível copiar"))
  }

  return (
    <div className="space-y-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
      {/* Descrição + tipo */}
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
            l.tipo === "RECEITA" ? "bg-receita/10 text-receita" : "bg-despesa/10 text-despesa"
          )}
        >
          {l.tipo === "RECEITA" ? (
            <ArrowUpRight className="h-4 w-4" />
          ) : (
            <ArrowDownRight className="h-4 w-4" />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug">{l.descricao}</p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(l.data), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 text-sm font-bold tabular-nums",
            l.tipo === "RECEITA" ? "text-receita" : "text-despesa"
          )}
        >
          {l.tipo === "RECEITA" ? "+" : "-"}
          {fmt(l.valor)}
        </span>
      </div>

      {/* Categoria + status */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {l.categoria ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              <span style={{ color: l.categoria.cor }}>
                <CategoryIcon slug={l.categoria.icone} size={13} />
              </span>
              {l.categoria.nome}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sem categoria</span>
          )}
          {l.conta && (
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Landmark className="h-3 w-3" />
              {l.conta.nome}
            </span>
          )}
        </div>
        <StatusBadge status={l.status} />
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 border-t pt-2">
        {l.codigoBarras && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copiar(l.codigoBarras!, "Código de barras")}
            className="h-10 px-3 text-xs"
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
            className="h-10 px-3 text-xs"
          >
            <Copy className="mr-1 h-3 w-3" />
            PIX
          </Button>
        )}
        <div className="ml-auto flex items-center gap-1">
          {(l.status === "PENDENTE" || l.status === "VENCIDO") && (
            <AlertDialog>
              <AlertDialogTrigger
                render={<Button variant="ghost" size="sm" className="h-10 px-3 text-xs" />}
              >
                <Check className="mr-1 h-3 w-3 text-receita" />
                Pagar
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Marcar como pago?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &ldquo;{l.descricao}&rdquo; terá o status alterado para Pago.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => marcarComoPago(l.id)}>
                    Confirmar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          <Link
            href={`/lancamentos/${l.id}/editar`}
            aria-label="Editar lançamento"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Link>
          <AlertDialog>
            <AlertDialogTrigger
              render={<Button variant="ghost" size="icon" className="h-10 w-10" />}
            >
              <Trash2 className="h-3.5 w-3.5 text-destructive" />
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir lançamento?</AlertDialogTitle>
                <AlertDialogDescription>
                  &ldquo;{l.descricao}&rdquo; será removido permanentemente. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => deletarLancamento(l.id)}
                >
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
