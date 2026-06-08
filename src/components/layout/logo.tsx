import { cn } from "@/lib/utils"

interface LogoMarkProps {
  className?: string
  size?: number
}

export function LogoMark({ className, size = 28 }: LogoMarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/icon/icon-grafico.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={cn("rounded-lg shrink-0", className)}
    />
  )
}

interface WordmarkProps {
  collapsed?: boolean
  className?: string
}

export function Wordmark({ collapsed = false, className }: WordmarkProps) {
  if (collapsed) {
    return <LogoMark size={28} className={className} />
  }
  return (
    <div className={cn("flex items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/logo/logo-light.png"
        alt="Finanças+"
        className="h-7 w-auto dark:hidden"
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/logo/logo-dark.png"
        alt="Finanças+"
        className="h-7 w-auto hidden dark:block"
      />
    </div>
  )
}
