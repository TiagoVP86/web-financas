"use client"

import { useActionState, useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import { atualizarPerfil } from "@/actions/auth"

interface Props {
  name: string
}

export function ProfileForm({ name }: Props) {
  const [state, action, pending] = useActionState(atualizarPerfil, null)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const isSuccess = state && "success" in state
  const error = state && "error" in state ? state.error : null

  useEffect(() => {
    if (isSuccess) toast.success("Perfil atualizado")
  }, [isSuccess])

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="profile-name">Nome</Label>
        <Input id="profile-name" name="name" defaultValue={name} />
      </div>
      <div className="space-y-1">
        <Label htmlFor="profile-current-password">Senha atual (para trocar senha)</Label>
        <div className="relative">
          <Input
            id="profile-current-password"
            name="currentPassword"
            type={showCurrent ? "text" : "password"}
            placeholder="Deixe em branco para não alterar"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showCurrent ? "Ocultar senha" : "Mostrar senha"}
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="profile-new-password">Nova senha</Label>
        <div className="relative">
          <Input
            id="profile-new-password"
            name="newPassword"
            type={showNew ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label={showNew ? "Ocultar senha" : "Mostrar senha"}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}
      {isSuccess && (
        <p className="rounded-lg ring-1 ring-receita/30 bg-receita/10 px-3 py-2 text-sm text-receita">
          Perfil atualizado com sucesso.
        </p>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar Perfil"}
      </Button>
    </form>
  )
}
