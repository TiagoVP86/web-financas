import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { BarChart3 } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center gap-3 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-2xl ring-1 ring-primary/30"
          style={{ background: "oklch(0.52 0.233 277 / 0.15)" }}
        >
          <BarChart3 className="h-7 w-7 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Minhas <span className="text-primary">Finanças</span>
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Controle financeiro pessoal</p>
        </div>
      </div>

      <div
        className="rounded-2xl border border-white/10 p-8"
        style={{ background: "oklch(0.13 0.01 277)" }}
      >
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
