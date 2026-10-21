"use client"

import { useState } from "react"
import { Eye, EyeOff, Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SenhaPdfDialogProps {
  nomeArquivo: string
  incorreta: boolean
  isLoading: boolean
  onSubmit: (senha: string) => void
  onCancel: () => void
}

export function SenhaPdfDialog({
  nomeArquivo,
  incorreta,
  isLoading,
  onSubmit,
  onCancel,
}: SenhaPdfDialogProps) {
  const [senha, setSenha] = useState("")
  const [mostrar, setMostrar] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (senha && !isLoading) onSubmit(senha)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !isLoading && onCancel()}>
      <DialogContent showCloseButton={false}>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Extrato protegido por senha
            </DialogTitle>
            <DialogDescription>
              Digite a senha para abrir <span className="font-medium break-all">{nomeArquivo}</span>.
              A senha é usada só para ler o arquivo e não é salva.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1">
            <Label htmlFor="senha-pdf">Senha do PDF</Label>
            <div className="relative">
              <Input
                id="senha-pdf"
                name="senha-pdf"
                type={mostrar ? "text" : "password"}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="off"
                autoFocus
                aria-invalid={incorreta}
                aria-describedby={incorreta ? "senha-pdf-erro" : undefined}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setMostrar((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={mostrar ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrar ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {incorreta && (
              <p id="senha-pdf-erro" role="alert" className="text-xs text-destructive">
                Senha incorreta. Tente novamente.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!senha || isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Abrir extrato
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
