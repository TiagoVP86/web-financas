import { Badge } from "@/components/ui/badge"

type Status = "PENDENTE" | "PAGO" | "VENCIDO" | "REALIZADO"

const statusConfig: Record<Status, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDENTE:  { label: "Pendente",  variant: "outline" },
  PAGO:      { label: "Pago",      variant: "default" },
  VENCIDO:   { label: "Vencido",   variant: "destructive" },
  REALIZADO: { label: "Realizado", variant: "secondary" },
}

export function StatusBadge({ status }: { status: Status }) {
  const { label, variant } = statusConfig[status]
  return <Badge variant={variant}>{label}</Badge>
}
