import { cn } from "@/lib/utils"

interface LogoMarkProps {
  className?: string
  size?: number
}

export function LogoMark({ className, size = 24 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("text-primary", className)}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="9.5" width="10" height="2" rx="1" fill="currentColor" />
      <rect x="7" y="12.5" width="7" height="2" rx="1" fill="currentColor" />
    </svg>
  )
}

interface WordmarkProps {
  collapsed?: boolean
  className?: string
}

export function Wordmark({ collapsed = false, className }: WordmarkProps) {
  if (collapsed) {
    return <LogoMark size={22} className={className} />
  }
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={20} />
      <span className="text-sm font-semibold tracking-tight whitespace-nowrap">
        Minhas <span className="text-primary">Finanças</span>
      </span>
    </div>
  )
}
