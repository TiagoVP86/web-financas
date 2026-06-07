"use client"

import { useActionState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { criarCategoria } from "@/actions/categorias"

export function CriarCategoriaForm() {
  const [state, action, pending] = useActionState(criarCategoria, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset()
      toast.success("Categoria adicionada")
    }
  }, [state])

  const error = state && "error" in state ? state.error : null

  return (
    <form ref={formRef} action={action} className="space-y-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 space-y-1">
          <Label>Nome</Label>
          <Input name="nome" placeholder="Ex: Viagens" required />
        </div>
        <div className="space-y-1">
          <Label>Cor</Label>
          <Input
            name="cor"
            type="color"
            defaultValue="#6366f1"
            className="h-9 w-16 p-1"
            required
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Adicionando..." : "Adicionar"}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </form>
  )
}
