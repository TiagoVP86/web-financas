"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { DarkModeToggle } from "./dark-mode-toggle"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Wallet,
} from "lucide-react"

const navItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/lancamentos",   label: "Lançamentos",   icon: Receipt },
  { href: "/relatorios",    label: "Relatórios",    icon: BarChart3 },
  { href: "/ia",            label: "Análise IA",    icon: Sparkles },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-card px-3 py-4">
      <div className="mb-6 flex items-center gap-2 px-2">
        <Wallet className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg">Web Finanças</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              pathname === href
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center justify-between px-2">
        <DarkModeToggle />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </aside>
  )
}
