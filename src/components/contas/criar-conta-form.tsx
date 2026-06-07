"use client"

import { useActionState, useEffect, useRef } from "react"
import { criarConta } from "@/actions/conta"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, Plus } from "lucide-react"
import { COR_PRESETS, TIPO_CONTA_LABELS } from "@/types/conta"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function CriarContaForm() {
  const [state, action, pending] = useActionState(criarConta, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset()
      toast.success("Conta adicionada")
    }
  }, [state])

  return (
    <div className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-4">
      <p className="text-sm font-medium">Nova conta</p>
      <form ref={formRef} action={action} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Nome</Label>
            <Input name="nome" placeholder="Ex: Nubank" required />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tipo</Label>
            <div className="relative">
              <select
                name="tipo"
                className="h-9 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(TIPO_CONTA_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Saldo inicial (R$)</Label>
          <Input name="saldoInicial" type="number" step="0.01" defaultValue="0" placeholder="0,00" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Cor</Label>
          <div className="flex gap-2 flex-wrap">
            {COR_PRESETS.map((cor, i) => (
              <label key={cor} className="cursor-pointer">
                <input
                  type="radio"
                  name="cor"
                  value={cor}
                  defaultChecked={i === 0}
                  className="sr-only peer"
                />
                <span
                  className="block h-6 w-6 rounded-full ring-2 ring-transparent ring-offset-1 peer-checked:ring-foreground transition-all"
                  style={{ backgroundColor: cor }}
                />
              </label>
            ))}
          </div>
        </div>
        {state && "error" in state && (
          <p className="text-xs text-destructive">{state.error}</p>
        )}
        <Button type="submit" disabled={pending} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          {pending ? "Salvando..." : "Adicionar conta"}
        </Button>
      </form>
    </div>
  )
}
