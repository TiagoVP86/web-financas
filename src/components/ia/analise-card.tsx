import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, Lightbulb } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import type { AnalysisResult } from "@/lib/gemini"

interface AnaliseCardProps {
  analise: { id: string; conteudo: string; createdAt: Date }
  isLatest?: boolean
}

export function AnaliseCard({ analise, isLatest }: AnaliseCardProps) {
  const data: AnalysisResult = JSON.parse(analise.conteudo)

  return (
    <Card className={isLatest ? "border-primary/50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>
            Análise de{" "}
            {format(new Date(analise.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          {isLatest && (
            <span className="text-xs font-normal text-primary">Mais recente</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{data.resumo}</p>

        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-green-500">
            <CheckCircle className="h-4 w-4" /> Pontos Positivos
          </h4>
          <ul className="space-y-1">
            {data.positivos.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">✓ {p}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-yellow-500">
            <AlertTriangle className="h-4 w-4" /> Pontos de Atenção
          </h4>
          <ul className="space-y-1">
            {data.atencao.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">⚠ {p}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-2 flex items-center gap-1 text-sm font-medium text-primary">
            <Lightbulb className="h-4 w-4" /> Sugestões
          </h4>
          <ul className="space-y-1">
            {data.sugestoes.map((p, i) => (
              <li key={i} className="text-sm text-muted-foreground">→ {p}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
