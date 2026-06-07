"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip, fmtBRLShort } from "@/components/charts/chart-helpers"

interface PatrimonioChartProps {
  data: { mes: string; saldo: number }[]
}

export function PatrimonioChart({ data }: PatrimonioChartProps) {
  const last = data[data.length - 1]?.saldo ?? 0
  const first = data[0]?.saldo ?? 0
  const delta = last - first
  const pct = first !== 0 ? ((delta / Math.abs(first)) * 100).toFixed(1) : null

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Patrimônio Líquido</CardTitle>
        {pct !== null && (
          <span className={`text-xs font-medium tabular-nums ${delta >= 0 ? "text-receita" : "text-despesa"}`}>
            {delta >= 0 ? "+" : ""}{pct}% nos últimos 12 meses
          </span>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <defs>
              <linearGradient id="patrimonioGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1} />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              dy={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={52}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={fmtBRLShort}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={<ChartTooltip />}
            />
            <Area
              type="monotone"
              dataKey="saldo"
              name="Patrimônio"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="url(#patrimonioGrad)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
