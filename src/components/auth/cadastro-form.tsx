"use client"

import { useActionState, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import { cadastrar, reenviarVerificacao } from "@/actions/auth"
import { Eye, EyeOff, MailCheck, AlertTriangle } from "lucide-react"
import Link from "next/link"

export function CadastroForm() {
  const [state, action] = useActionState(cadastrar, null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [email, setEmail] = useState("")
  const [resent, setResent] = useState<"idle" | "ok" | "error">("idle")

  if (state?.success && state.emailSent === false) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10">
          <AlertTriangle className="h-7 w-7 text-amber-600" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Conta criada</p>
          <p className="text-sm text-muted-foreground">
            Não conseguimos enviar o email de confirmação agora. Tente reenviar.
          </p>
        </div>
        {resent === "ok" ? (
          <p className="text-sm font-medium text-primary">Email reenviado.</p>
        ) : (
          <button
            type="button"
            onClick={async () => {
              const r = await reenviarVerificacao(email)
              setResent(r.success ? "ok" : "error")
            }}
            className="mt-1 text-sm font-medium text-primary hover:underline"
          >
            Reenviar email de confirmação
          </button>
        )}
        {resent === "error" && (
          <p className="text-sm text-destructive">Falhou de novo. Tente mais tarde.</p>
        )}
        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          Ir para o login
        </Link>
      </div>
    )
  }

  if (state?.success) {
    return (
      <div className="flex flex-col items-center gap-4 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-1">
          <p className="font-semibold text-foreground">Verifique seu email</p>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de confirmação. Clique nele para ativar sua conta.
          </p>
        </div>
        <Link
          href="/login"
          className="mt-2 text-sm font-medium text-primary hover:underline"
        >
          Ir para o login
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input id="name" name="name" required autoComplete="name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            required
            minLength={6}
            autoComplete="new-password"
            className="pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={showConfirm ? "Ocultar senha" : "Mostrar senha"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>
      {state?.error && (
        <p className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {state.error}
        </p>
      )}
      <SubmitButton className="w-full">Criar conta</SubmitButton>
    </form>
  )
}
