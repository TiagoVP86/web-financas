"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Sector, type PieSectorDataItem } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { fmtBRL } from "@/components/charts/chart-helpers"
import { useState } from "react"

interface CategoryPieChartProps {
  data: { nome: string; valor: number; cor: string }[]
  periodo?: string
}

function ActiveSlice(props: PieSectorDataItem) {
  const { cx = 0, cy = 0, innerRadius = 0, outerRadius = 0, startAngle = 0, endAngle = 0, fill } = props
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={Number(innerRadius) - 3}
      outerRadius={Number(outerRadius) + 6}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
    />
  )
}

export function CategoryPieChart({ data, periodo }: CategoryPieChartProps) {
  const total = data.reduce((s, d) => s + d.valor, 0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const active = activeIndex !== null ? data[activeIndex] : null

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
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            {/* donut */}
            <div className="relative h-[220px] w-full max-w-[220px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    dataKey="valor"
                    nameKey="nome"
                    cx="50%"
                    cy="50%"
                    innerRadius={64}
                    outerRadius={92}
                    paddingAngle={2}
                    strokeWidth={0}
                    activeShape={ActiveSlice}
                    onMouseEnter={(_, i) => setActiveIndex(i)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {data.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.cor}
                        opacity={activeIndex === null || activeIndex === i ? 1 : 0.45}
                        style={{ cursor: "pointer", transition: "opacity 150ms" }}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* center label */}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                {active ? (
                  <>
                    <span
                      className="mb-1 h-1 w-8 rounded-full"
                      style={{ background: active.cor }}
                    />
                    <span className="max-w-[110px] truncate text-xs text-muted-foreground leading-tight">
                      {active.nome}
                    </span>
                    <span className="mt-0.5 text-base font-bold tabular-nums leading-tight">
                      {fmtBRL(active.valor)}
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {total > 0 ? ((active.valor / total) * 100).toFixed(1) : 0}%
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-muted-foreground">Total</span>
                    <span className="text-lg font-bold tabular-nums leading-tight">
                      {fmtBRL(total)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* legend */}
            <ul className="grid w-full flex-1 gap-2.5">
              {data.map((c, i) => (
                <li
                  key={c.nome}
                  className="flex cursor-default items-center gap-2.5 text-sm transition-opacity"
                  style={{ opacity: activeIndex === null || activeIndex === i ? 1 : 0.4 }}
                  onMouseEnter={() => setActiveIndex(i)}
                  onMouseLeave={() => setActiveIndex(null)}
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: c.cor }}
                  />
                  <span className="truncate text-foreground">{c.nome}</span>
                  <div className="ml-auto flex shrink-0 flex-col items-end">
                    <span className="tabular-nums font-medium">{fmtBRL(c.valor)}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {total > 0 ? ((c.valor / total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
