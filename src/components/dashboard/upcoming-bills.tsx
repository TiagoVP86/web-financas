import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarClock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

interface Bill {
  id: string
  descricao: string
  valor: number | string | { toString(): string }
  data: Date
  status: string
  categoria: { nome: string; cor: string } | null
}

interface UpcomingBillsProps {
  bills: Bill[]
}

export function UpcomingBills({ bills }: UpcomingBillsProps) {
  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const isOverdue = (date: Date) => new Date(date) < today

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-alerta/10 text-alerta">
            <CalendarClock className="h-4 w-4" />
          </span>
          <CardTitle className="text-base">Próximas Contas</CardTitle>
        </div>
        <Link href="/lancamentos?status=PENDENTE" className="text-xs text-primary hover:underline">
          Ver todos
        </Link>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/ilustracoes/tudo-em-dia.svg" alt="" aria-hidden="true" className="h-20 w-20 opacity-80" />
            <p className="text-sm text-muted-foreground">Nenhuma conta pendente.</p>
          </div>
        ) : (
          <div className="-mx-2 divide-y divide-border/60">
            {bills.map((bill) => {
              const overdue = isOverdue(bill.data)
              return (
                <div
                  key={bill.id}
                  className="flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors hover:bg-muted/50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: bill.categoria?.cor ?? "var(--muted-foreground)" }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{bill.descricao}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(bill.data), "dd MMM", { locale: ptBR })}
                        {bill.categoria && ` · ${bill.categoria.nome}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold tabular-nums">{fmt(Number(bill.valor))}</span>
                    <Badge variant={overdue ? "destructive" : "outline"}>
                      {overdue ? "Vencido" : "Pendente"}
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
