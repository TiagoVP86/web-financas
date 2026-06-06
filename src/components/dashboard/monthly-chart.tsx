"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip, fmtBRLShort } from "@/components/charts/chart-helpers"

interface MonthlyChartProps {
  data: { mes: string; receitas: number; despesas: number }[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Receitas vs Despesas</CardTitle>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--receita)]" /> Receitas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[var(--despesa)]" /> Despesas
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
            <defs>
              <linearGradient id="dashReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--receita)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--receita)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dashDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--despesa)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--despesa)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
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
              width={48}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickFormatter={fmtBRLShort}
            />
            <Tooltip
              cursor={{ stroke: "var(--border)", strokeWidth: 1 }}
              content={<ChartTooltip />}
            />
            <Area
              type="monotone"
              dataKey="receitas"
              name="Receitas"
              stroke="var(--receita)"
              strokeWidth={2.5}
              fill="url(#dashReceitas)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
            <Area
              type="monotone"
              dataKey="despesas"
              name="Despesas"
              stroke="var(--despesa)"
              strokeWidth={2.5}
              fill="url(#dashDespesas)"
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
