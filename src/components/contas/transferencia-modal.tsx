"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { realizarTransferencia } from "@/actions/transferencia"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { format } from "date-fns"

interface Conta {
  id: string
  nome: string
}

interface Props {
  open: boolean
  onClose: () => void
  contas: Conta[]
}

const selectClass =
  "h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"

export function TransferenciaModal({ open, onClose, contas }: Props) {
  const [state, action, pending] = useActionState(realizarTransferencia, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!state) return
    if ("success" in state) {
      toast.success("Transferência realizada")
      formRef.current?.reset()
      onClose()
    } else if ("error" in state) {
      toast.error(state.error)
    }
  }, [state, onClose])

  const today = format(new Date(), "yyyy-MM-dd")

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova transferência</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={action} className="space-y-4 py-2">
          <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
            <div className="space-y-1">
              <Label>Origem</Label>
              <div className="relative">
                <select name="contaOrigemId" className={selectClass} required>
                  <option value="">Selecionar</option>
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <ArrowRight className="mb-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="space-y-1">
              <Label>Destino</Label>
              <div className="relative">
                <select name="contaDestinoId" className={selectClass} required>
                  <option value="">Selecionar</option>
                  {contas.map((c) => (
                    <option key={c.id} value={c.id}>{c.nome}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Valor (R$)</Label>
              <Input
                name="valor"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-1">
              <Label>Data</Label>
              <Input name="data" type="date" defaultValue={today} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>Descrição (opcional)</Label>
            <Input name="descricao" placeholder="Transferência" />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Transferindo..." : "Transferir"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
