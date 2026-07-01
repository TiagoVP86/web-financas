import Link from "next/link"
import { Landmark } from "lucide-react"

export default function ContaNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl bg-card p-12 text-center ring-1 ring-foreground/10">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Landmark className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-medium">Conta não encontrada</p>
        <p className="text-sm text-muted-foreground">
          Essa conta não existe ou não pertence a você.
        </p>
      </div>
      <Link href="/contas" className="text-sm font-medium text-primary hover:underline">
        Voltar para contas
      </Link>
    </div>
  )
}
