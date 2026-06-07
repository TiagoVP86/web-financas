"use client"

import { useActionState, useEffect } from "react"
import { toast } from "sonner"
import { gerarAnalise } from "@/actions/ia"
import { AnalyzeButton } from "./analyze-button"

export function AnalyzeForm() {
  const [state, action] = useActionState(gerarAnalise, null)

  useEffect(() => {
    if (!state) return
    if ("success" in state) toast.success("Análise gerada pela Sofia")
    else if ("error" in state) toast.error(state.error)
  }, [state])

  return (
    <form action={action}>
      <AnalyzeButton />
    </form>
  )
}
