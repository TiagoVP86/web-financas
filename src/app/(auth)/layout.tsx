import { DarkModeToggle } from "@/components/layout/dark-mode-toggle"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="absolute right-4 top-4">
        <DarkModeToggle />
      </div>
      <div className="w-full max-w-md px-4 py-12">{children}</div>
    </div>
  )
}
