"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
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
import { excluirAnaliseExtrato } from "@/actions/extrato"

export function ExcluirAnaliseButton({
  analiseId,
  nomeArquivo,
  importados,
}: {
  analiseId: string
  nomeArquivo: string
  importados: number
}) {
  const [isPending, startTransition] = useTransition()

  function excluir() {
    startTransition(async () => {
      const res = await excluirAnaliseExtrato(analiseId)
      if (!res.ok) {
        toast.error(res.error)
        return
      }
      toast.success(
        res.lancamentosRemovidos > 0
          ? `Análise excluída e ${res.lancamentosRemovidos} lançamento(s) removido(s).`
          : "Análise excluída."
      )
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            aria-label={`Excluir análise ${nomeArquivo}`}
            disabled={isPending}
          />
        }
      >
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir análise de extrato?</AlertDialogTitle>
          <AlertDialogDescription>
            &ldquo;{nomeArquivo}&rdquo; será removida
            {importados > 0
              ? `, junto com os ${importados} lançamento(s) importados dela`
              : ""}
            . Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={excluir}
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
