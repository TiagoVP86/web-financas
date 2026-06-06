"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AppError({ error, reset }: Props) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="font-semibold">Algo deu errado</p>
        <p className="text-sm text-muted-foreground">
          Tente novamente. Se o erro persistir, recarregue a página.
        </p>
      </div>
      <Button variant="outline" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  )
}
