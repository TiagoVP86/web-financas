import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { LogoMark } from "@/components/layout/logo"

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <LogoMark size={48} className="rounded-2xl" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Finanças<span className="text-primary">+</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Controle financeiro pessoal</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-foreground">Entrar</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Acesse sua conta</p>
        </div>
        <LoginForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-primary hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  )
}
