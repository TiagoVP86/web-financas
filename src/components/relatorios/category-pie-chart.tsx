"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartTooltip, fmtBRL } from "@/components/charts/chart-helpers"

interface CategoryPieChartProps {
  data: { nome: string; valor: number; cor: string }[]
  periodo?: string
}

export function CategoryPieChart({ data, periodo }: CategoryPieChartProps) {
  const total = data.reduce((s, d) => s + d.valor, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          Despesas por Categoria{periodo ? ` — ${periodo}` : ""}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sem despesas no período.
          </p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="relative h-[220px] w-full max-w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="valor"
                    nameKey="nome"
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={92}
                    paddingAngle={2}
                    strokeWidth={1.5}
                    stroke="var(--border)"
                  >
                    {data.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip title={(item) => item.name} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground">Total</span>
                <span className="text-lg font-bold tabular-nums">{fmtBRL(total)}</span>
              </div>
            </div>
            <ul className="grid w-full flex-1 gap-2">
              {data.map((c) => (
                <li key={c.nome} className="flex items-center gap-2 text-sm">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full ring-1 ring-foreground/15"
                    style={{ backgroundColor: c.cor }}
                  />
                  <span className="truncate">{c.nome}</span>
                  <span className="ml-auto shrink-0 text-muted-foreground tabular-nums">
                    {total > 0 ? ((c.valor / total) * 100).toFixed(0) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
