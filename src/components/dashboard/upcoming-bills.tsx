import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

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

  const isOverdue = (date: Date) => new Date(date) < new Date()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Próximas Contas</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma conta pendente.</p>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{bill.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(bill.data), "dd MMM", { locale: ptBR })}
                    {bill.categoria && ` · ${bill.categoria.nome}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{fmt(Number(bill.valor))}</span>
                  <Badge variant={isOverdue(bill.data) ? "destructive" : "outline"}>
                    {isOverdue(bill.data) ? "Vencido" : "Pendente"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
