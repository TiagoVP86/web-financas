import { verificarEmail } from "@/actions/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

interface Props {
  searchParams: Promise<{ token?: string }>
}

export default async function VerificarEmailPage({ searchParams }: Props) {
  const { token } = await searchParams

  if (!token) {
    return <ErrorCard message="Link inválido." />
  }

  const result = await verificarEmail(token)

  if (!result.success) {
    return <ErrorCard message={result.error ?? "Link inválido ou já utilizado."} />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          Email confirmado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Sua conta foi ativada. Faça login para começar.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Ir para o login
        </Link>
      </CardContent>
    </Card>
  )
}

function ErrorCard({ message }: { message: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <XCircle className="h-5 w-5 text-destructive" />
          Link inválido
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link
          href="/cadastro"
          className="text-sm font-medium text-primary hover:underline"
        >
          Criar nova conta
        </Link>
      </CardContent>
    </Card>
  )
}
