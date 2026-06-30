"use client"

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, ReferenceLine, Tooltip, XAxis, YAxis } from "recharts"
import { ChartTooltip, fmtBRLShort } from "@/components/charts/chart-helpers"

interface SaldoContaChartProps {
  data: { mes: string; saldo: number }[]
}

export function SaldoContaChart({ data }: SaldoContaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
        <defs>
          <linearGradient id="saldoContaGrad" x1="0" y1="0" x2="0" y2="1">
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
        <Tooltip cursor={{ stroke: "var(--border)", strokeWidth: 1 }} content={<ChartTooltip />} />
        <Area
          type="monotone"
          dataKey="saldo"
          name="Saldo"
          stroke="var(--primary)"
          strokeWidth={2.5}
          fill="url(#saldoContaGrad)"
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
