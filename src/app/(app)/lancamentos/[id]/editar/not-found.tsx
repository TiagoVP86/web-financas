import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { FileX } from "lucide-react"

export default function LancamentoNotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <FileX className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="font-semibold">Lançamento não encontrado</p>
        <p className="text-sm text-muted-foreground">
          Esse lançamento não existe ou não pertence à sua conta.
        </p>
      </div>
      <Link href="/lancamentos" className={buttonVariants({ variant: "outline" })}>
        Voltar para Lançamentos
      </Link>
    </div>
  )
}
