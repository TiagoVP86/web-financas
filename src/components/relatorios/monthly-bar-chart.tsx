"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
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
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="relReceitas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--receita)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--receita)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="relDespesas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--despesa)" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="var(--despesa)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="var(--border)"
              />
              <XAxis
                dataKey="mes"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                dy={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
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
                fill="url(#relReceitas)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
              <Area
                type="monotone"
                dataKey="despesas"
                name="Despesas"
                stroke="var(--despesa)"
                strokeWidth={2.5}
                fill="url(#relDespesas)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
