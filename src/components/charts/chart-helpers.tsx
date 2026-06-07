"use client"

import type { ReactNode } from "react"

export const fmtBRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

export const fmtBRLShort = (v: number) => {
  const abs = Math.abs(v)
  if (abs >= 1_000_000) return `R$${(v / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `R$${(v / 1_000).toFixed(1)}k`
  return `R$${v}`
}

interface TooltipPayloadItem {
  name?: string
  value?: number | string
  color?: string
  payload?: Record<string, unknown>
}

interface ChartTooltipProps {
  active?: boolean
  label?: ReactNode
  payload?: TooltipPayloadItem[]
  title?: (item: TooltipPayloadItem) => ReactNode
}

export function ChartTooltip({ active, label, payload, title }: ChartTooltipProps) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg bg-popover px-3 py-2 text-popover-foreground ring-1 ring-border">
      {label != null && (
        <p className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-muted-foreground">
              {title ? title(item) : item.name}
            </span>
            <span className="ml-auto font-semibold tabular-nums">
              {fmtBRL(Number(item.value))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
