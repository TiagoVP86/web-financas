import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { AnalysisResult } from "@/lib/groq"
import type { LucideIcon } from "lucide-react"

function Section({
  icon: Icon,
  title,
  items,
  className,
}: {
  icon: LucideIcon
  title: string
  items: string[]
  className: string
}) {
  if (!items?.length) return null
  return (
    <div className={cn("rounded-lg border p-3", className)}>
      <h4 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <Icon className="h-4 w-4" /> {title}
      </h4>
      <ul className="space-y-1.5">
        {items.map((p, i) => (
          <li key={i} className="flex gap-2 text-sm text-muted-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-current opacity-50" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  )
}

interface AnaliseCardProps {
  analise: { id: string; conteudo: string; createdAt: Date }
  isLatest?: boolean
}

export function AnaliseCard({ analise, isLatest }: AnaliseCardProps) {
  const data: AnalysisResult = JSON.parse(analise.conteudo)

  return (
    <Card className={isLatest ? "ring-2 ring-primary/40" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2 text-base">
          <span>
            Análise de{" "}
            {format(new Date(analise.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          {isLatest && <Badge>Mais recente</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{data.resumo}</p>

        <Section
          icon={CheckCircle}
          title="Pontos positivos"
          items={data.positivos}
          className="border-receita/30 bg-receita/5 text-receita"
        />
        <Section
          icon={AlertTriangle}
          title="Pontos de atenção"
          items={data.atencao}
          className="border-alerta/30 bg-alerta/5 text-alerta"
        />
        <Section
          icon={Lightbulb}
          title="Sugestões"
          items={data.sugestoes}
          className="border-primary/30 bg-primary/5 text-primary"
        />
      </CardContent>
    </Card>
  )
}
