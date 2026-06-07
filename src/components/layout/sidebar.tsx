"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { DarkModeToggle } from "./dark-mode-toggle"
import { NotificationBell } from "./notification-bell"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Receipt,
  BarChart3,
  Sparkles,
  Settings,
  LogOut,
  Menu,
  FileSearch,
  RefreshCw,
  PiggyBank,
  CreditCard,
  Landmark,
  Target,
} from "lucide-react"
import { useState } from "react"

function Wordmark({ collapsed = false }: { collapsed?: boolean }) {
  if (collapsed) {
    return <span className="text-lg font-bold tracking-tight text-primary">MF</span>
  }
  return (
    <span className="text-lg font-bold tracking-tight whitespace-nowrap">
      Minhas <span className="text-primary">Finanças</span>
    </span>
  )
}

const navLinkClass = (active: boolean) =>
  cn(
    "flex items-center rounded-lg text-sm font-medium transition-colors",
    active
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:bg-muted hover:text-foreground"
  )

const navItems = [
  { href: "/dashboard",     label: "Dashboard",     icon: LayoutDashboard },
  { href: "/lancamentos",   label: "Lançamentos",   icon: Receipt },
  { href: "/recorrencias",  label: "Recorrências",  icon: RefreshCw },
  { href: "/orcamento",     label: "Orçamento",     icon: PiggyBank },
  { href: "/parcelamento",  label: "Parcelamentos", icon: CreditCard },
  { href: "/contas",        label: "Contas",        icon: Landmark },
  { href: "/metas",         label: "Metas",         icon: Target },
  { href: "/relatorios",    label: "Relatórios",    icon: BarChart3 },
  { href: "/ia",            label: "Análise IA",    icon: Sparkles },
  { href: "/extrato",       label: "Extrato",       icon: FileSearch },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
]

function NavContent({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <>
      <div className="mb-6 flex items-center px-2">
        <Wordmark />
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(navLinkClass(pathname === href), "gap-3 px-3 py-2")}
          >
            <Icon className="h-4 w-4" />
            {label}
          </Link>
        ))}
      </nav>
      <div className="flex items-center justify-between px-2">
        <NotificationBell />
        <DarkModeToggle />
        <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <>
      {/* Desktop sidebar — collapsed (icons only) by default, expands on hover */}
      <aside
        className={cn(
          "hidden md:flex h-screen flex-shrink-0 flex-col border-r bg-card py-4 transition-all duration-200 overflow-hidden",
          hovered ? "w-56 px-3" : "w-14 px-2"
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Logo */}
        <div className={cn("mb-6 flex h-7 items-center", hovered ? "px-2" : "justify-center")}>
          <Wordmark collapsed={!hovered} />
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={!hovered ? label : undefined}
              className={cn(navLinkClass(pathname === href), "py-2", hovered ? "gap-3 px-3" : "justify-center px-2")}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {hovered && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className={cn("flex items-center", hovered ? "justify-between px-2" : "flex-col gap-1 px-0")}>
          <NotificationBell />
          <DarkModeToggle />
          <Button variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: "/login" })}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center">
          <Wordmark />
        </div>
        <div className="flex items-center gap-1">
          <DarkModeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent hover:text-accent-foreground">
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-3 flex flex-col">
              <NavContent pathname={pathname} onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
