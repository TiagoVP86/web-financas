"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2 } from "lucide-react"

export function AnalyzeButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {pending ? "Analisando..." : "Analisar agora"}
    </Button>
  )
}
