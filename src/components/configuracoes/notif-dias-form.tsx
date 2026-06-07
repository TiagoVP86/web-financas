"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { atualizarNotifDias } from "@/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function NotifDiasForm({ notifDias }: { notifDias: number }) {
  const [state, action, pending] = useActionState(atualizarNotifDias, null)

  useEffect(() => {
    if (!state) return
    if ("success" in state) toast.success("Preferência salva")
    else if ("error" in state) toast.error(state.error)
  }, [state])

  return (
    <form action={action} className="flex items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="notif-dias">Notificar com antecedência de</Label>
        <div className="flex items-center gap-2">
          <Input
            id="notif-dias"
            name="notifDias"
            type="number"
            min={1}
            max={30}
            defaultValue={notifDias}
            className="w-20"
          />
          <span className="text-sm text-muted-foreground">dia(s)</span>
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  )
}
