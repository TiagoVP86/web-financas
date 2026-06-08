import { cn } from "@/lib/utils"

export type CategorySlug =
  | "alimentacao"
  | "assinaturas"
  | "cartao"
  | "educacao"
  | "investimentos"
  | "lazer"
  | "mercado"
  | "moradia"
  | "outros"
  | "salario"
  | "saude"
  | "transporte"

const paths: Record<CategorySlug, React.ReactNode> = {
  alimentacao: (
    <>
      <path d="M7 3v8a2 2 0 0 0 2 2v8M7 3v5M11 3v5M9 3v5" transform="translate(-2 0)" />
      <path d="M16.5 3c-1.4 0-2.5 2-2.5 5s1 4 2.5 4M16.5 3v18" />
    </>
  ),
  assinaturas: (
    <>
      <path d="M4 12a8 8 0 0 1 13.3-5.9L20 8" />
      <path d="M20 4v4h-4" />
      <path d="M20 12a8 8 0 0 1-13.3 5.9L4 16" />
      <path d="M4 20v-4h4" />
    </>
  ),
  cartao: (
    <>
      <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
      <path d="M3 9.5h18M6.5 14.5h4" />
    </>
  ),
  educacao: (
    <>
      <path d="M3 8.5 12 4l9 4.5-9 4.5z" />
      <path d="M7 10.7V15c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-4.3" />
      <path d="M21 8.5v5" />
    </>
  ),
  investimentos: (
    <>
      <path d="M4 15.5 9.5 10l3.5 3.4L20 6" />
      <path d="M15.5 6H20v4.5" />
    </>
  ),
  lazer: (
    <>
      <path d="M4 8a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2 2 2 0 0 0 0 8 2 2 0 0 0-2 2H6a2 2 0 0 0-2-2 2 2 0 0 0 0-8z" />
      <path d="M12 7.5v1M12 11.5v1M12 15.5v1" />
    </>
  ),
  mercado: (
    <>
      <circle cx="9" cy="20" r="1.3" />
      <circle cx="18" cy="20" r="1.3" />
      <path d="M2.5 3h2l2.2 11.2a1.4 1.4 0 0 0 1.4 1.1h8.4a1.4 1.4 0 0 0 1.4-1.1L21 6.5H6" />
    </>
  ),
  moradia: (
    <>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M5.5 9.5V19a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
      <path d="M10 20v-5h4v5" />
    </>
  ),
  outros: (
    <>
      <circle cx="5.5" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18.5" cy="12" r="1.4" />
    </>
  ),
  salario: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.6" />
      <path d="M6 9.2v.01M18 14.8v.01" />
    </>
  ),
  saude: (
    <path d="M12 20s-7-4.6-7-9.5A4 4 0 0 1 12 7a4 4 0 0 1 7 3.5C19 15.4 12 20 12 20z" />
  ),
  transporte: (
    <>
      <path d="M4 11l1.6-4.4A2 2 0 0 1 7.5 5.3h9a2 2 0 0 1 1.9 1.3L20 11" />
      <path d="M3 11h18v5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1H6.5v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z" />
      <path d="M6 14h.01M18 14h.01" />
    </>
  ),
}

const fallback = (
  <>
    <circle cx="5.5" cy="12" r="1.4" />
    <circle cx="12" cy="12" r="1.4" />
    <circle cx="18.5" cy="12" r="1.4" />
  </>
)

interface CategoryIconProps {
  slug?: string | null
  size?: number
  className?: string
}

export function CategoryIcon({ slug, size = 16, className }: CategoryIconProps) {
  const content = slug && slug in paths ? paths[slug as CategorySlug] : fallback
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {content}
    </svg>
  )
}
