"use client"

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip, fmtBRLShort } from "@/components/charts/chart-helpers"

interface MonthlyBarChartProps {
  data: { mes: string; receitas: number; despesas: number }[]
}

export function MonthlyBarChart({ data }: MonthlyBarChartProps) {
  const isEmpty = data.every((d) => d.receitas === 0 && d.despesas === 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <CardTitle className="text-base">Receitas vs Despesas — últimos 12 meses</CardTitle>
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
        {isEmpty ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Sem lançamentos nos últimos 12 meses.
          </p>
        ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }} barGap={4}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              dy={6}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={48}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={fmtBRLShort}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.4, radius: 6 }}
              content={<ChartTooltip />}
            />
            <Bar dataKey="receitas" name="Receitas" fill="var(--receita)" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="despesas" name="Despesas" fill="var(--despesa)" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
