"use client"

import { StatusBadge } from "./status-badge"
import { LancamentoCard } from "./lancamento-card"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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
import { Copy, Check, Trash2, Pencil, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { toast } from "sonner"
import { marcarComoPago, deletarLancamento } from "@/actions/lancamentos"
import Link from "next/link"
import { CategoryIcon } from "@/components/ui/category-icon"

type Status = "PENDENTE" | "PAGO" | "VENCIDO" | "REALIZADO"
type Tipo = "RECEITA" | "DESPESA"

export interface LancamentoRow {
  id: string
  descricao: string
  valor: { toString(): string } | number | string
  tipo: Tipo
  data: Date
  status: Status
  codigoBarras: string | null
  chavePix: string | null
  categoria: { nome: string; cor: string; icone?: string | null } | null
  conta: { id: string; nome: string } | null
}

interface LancamentosTableProps {
  lancamentos: LancamentoRow[]
}

export function LancamentosTable({ lancamentos }: LancamentosTableProps) {
  const fmt = (v: unknown) =>
    Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const copiar = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success(`${label} copiado!`))
      .catch(() => toast.error("Não foi possível copiar"))
  }

  if (lancamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/ilustracoes/sem-transacoes.svg" alt="" aria-hidden="true" className="h-24 w-24 opacity-80" />
        <p className="text-sm text-muted-foreground">Nenhum lançamento encontrado para os filtros selecionados.</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden space-y-2">
        {lancamentos.map((l) => (
          <LancamentoCard key={l.id} lancamento={l} />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 md:block">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40">
            <tr className="text-xs uppercase tracking-wide text-muted-foreground">
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
              <tr key={l.id} className="border-b border-border/60 transition-colors last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                        l.tipo === "RECEITA" ? "bg-receita/10 text-receita" : "bg-despesa/10 text-despesa"
                      )}
                    >
                      {l.tipo === "RECEITA" ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <span className="font-medium">{l.descricao}</span>
                      {l.conta && (
                        <p className="text-xs text-muted-foreground">{l.conta.nome}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {l.categoria ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                      <span style={{ color: l.categoria.cor }}>
                        <CategoryIcon slug={l.categoria.icone} size={13} />
                      </span>
                      {l.categoria.nome}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground tabular-nums">
                  {format(new Date(l.data), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className={cn("px-4 py-3 text-right font-semibold tabular-nums", l.tipo === "RECEITA" ? "text-receita" : "text-despesa")}>
                  {l.tipo === "RECEITA" ? "+" : "-"}{fmt(l.valor)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {l.codigoBarras && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copiar(l.codigoBarras!, "Código de barras")}
                        className="h-8 gap-1 px-2 text-[11px]"
                      >
                        <Copy className="h-3 w-3" />
                        Cód.
                      </Button>
                    )}
                    {l.chavePix && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copiar(l.chavePix!, "Chave PIX")}
                        className="h-8 gap-1 px-2 text-[11px]"
                      >
                        <Copy className="h-3 w-3" />
                        PIX
                      </Button>
                    )}
                    {(l.status === "PENDENTE" || l.status === "VENCIDO") && (
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={<Button variant="ghost" size="icon" title="Marcar como pago" />}
                        >
                          <Check className="h-3 w-3 text-receita" />
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
                      title="Editar"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent"
                    >
                      <Pencil className="h-3 w-3" />
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={<Button variant="ghost" size="icon" title="Excluir" />}
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
