"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { criarMeta } from "@/actions/meta"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface Props {
  open: boolean
  onClose: () => void
  onCreated: () => void
}

export function CriarMetaModal({ open, onClose, onCreated }: Props) {
  const [state, action, pending] = useActionState(criarMeta, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (!state) return
    if ("success" in state) {
      toast.success("Meta criada")
      formRef.current?.reset()
      onCreated()
      onClose()
    }
  }, [state, onClose, onCreated])

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Nova meta</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={action} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="meta-titulo">Título</Label>
            <Input
              id="meta-titulo"
              name="titulo"
              placeholder="Ex: Viagem para Europa"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="meta-valor">Valor alvo (R$)</Label>
            <Input
              id="meta-valor"
              name="valorAlvo"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0,00"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="meta-prazo">Prazo (opcional)</Label>
              <Input
                id="meta-prazo"
                name="prazo"
                type="date"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="meta-cor">Cor</Label>
              <Input
                id="meta-cor"
                name="cor"
                type="color"
                defaultValue="#059669"
                className="h-9 w-full p-1"
              />
            </div>
          </div>
          {"error" in (state ?? {}) && (
            <p className="text-sm text-destructive">{(state as { error: string }).error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Criando..." : "Criar meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
