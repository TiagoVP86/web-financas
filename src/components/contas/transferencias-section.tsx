"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeftRight, Trash2 } from "lucide-react"
import { toast } from "sonner"
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
import { TransferenciaModal } from "./transferencia-modal"
import { deletarTransferencia } from "@/actions/transferencia"

interface TransferenciaItem {
  id: string
  valor: number
  data: string
  descricao: string | null
  contaOrigem: { nome: string }
  contaDestino: { nome: string }
}

interface Conta {
  id: string
  nome: string
}

interface Props {
  transferencias: TransferenciaItem[]
  contas: Conta[]
}

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export function TransferenciasSection({ transferencias: initial, contas }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [items, setItems] = useState(initial)

  async function handleDelete(id: string) {
    try {
      await deletarTransferencia(id)
      setItems((prev) => prev.filter((t) => t.id !== id))
      toast.success("Transferência excluída")
    } catch {
      toast.error("Erro ao excluir")
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground">Transferências recentes</h2>
        {contas.length >= 2 && (
          <Button size="sm" variant="outline" onClick={() => setModalOpen(true)}>
            <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
            Nova transferência
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">Nenhuma transferência ainda.</p>
          {contas.length >= 2 && (
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setModalOpen(true)}>
              <ArrowLeftRight className="mr-2 h-3.5 w-3.5" />
              Nova transferência
            </Button>
          )}
          {contas.length < 2 && (
            <p className="mt-1 text-xs text-muted-foreground">Cadastre ao menos 2 contas para transferir.</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-3 rounded-xl bg-card ring-1 ring-foreground/10 px-4 py-3"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <span className="truncate">{t.contaOrigem.nome}</span>
                  <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="truncate">{t.contaDestino.nome}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(t.data), "dd/MM/yyyy", { locale: ptBR })}
                  {t.descricao && t.descricao !== "Transferência" && ` · ${t.descricao}`}
                </p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums">{fmt(t.valor)}</span>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    />
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir transferência?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Os dois lançamentos gerados ({t.contaOrigem.nome} e {t.contaDestino.nome}) serão removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDelete(t.id)}
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))}
        </div>
      )}

      <TransferenciaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        contas={contas}
      />
    </>
  )
}
