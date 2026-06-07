"use client"

import { Search } from "lucide-react"

interface Props {
  defaultValue?: string
}

export function BuscaInput({ defaultValue = "" }: Props) {
  return (
    <div
      className="relative ml-auto"
      onChange={(e) => e.stopPropagation()}
    >
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        name="busca"
        type="search"
        defaultValue={defaultValue}
        placeholder="Buscar descrição…"
        className="h-9 w-48 rounded-lg border border-input bg-background pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
      />
    </div>
  )
}
