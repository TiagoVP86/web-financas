import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  totalPages: number
  /** Base da URL; `?page=N` é anexado. Ex.: "/contas/abc123" */
  baseHref: string
}

export function Pagination({ page, totalPages, baseHref }: PaginationProps) {
  if (totalPages <= 1) return null

  const prev = Math.max(1, page - 1)
  const next = Math.min(totalPages, page + 1)
  const linkClass =
    "inline-flex h-9 items-center gap-1 rounded-lg border border-input bg-background px-3 text-sm transition-colors hover:bg-accent"
  const disabled = "pointer-events-none opacity-50"

  return (
    <div className="flex items-center justify-between">
      <Link
        href={`${baseHref}?page=${prev}`}
        aria-disabled={page <= 1}
        className={cn(linkClass, page <= 1 && disabled)}
      >
        <ChevronLeft className="h-4 w-4" />
        Anterior
      </Link>
      <span className="text-sm text-muted-foreground tabular-nums">
        Página {page} de {totalPages}
      </span>
      <Link
        href={`${baseHref}?page=${next}`}
        aria-disabled={page >= totalPages}
        className={cn(linkClass, page >= totalPages && disabled)}
      >
        Próxima
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
