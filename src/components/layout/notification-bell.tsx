"use client"

import { useEffect, useRef, useState } from "react"
import { Bell, BellDot, AlertCircle, Clock, CheckCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface Notificacao {
  id: string
  tipo: "VENCIMENTO_PROXIMO" | "VENCIDO"
  titulo: string
  mensagem: string
  lida: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifs, setNotifs] = useState<Notificacao[]>([])
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const unread = notifs.filter((n) => !n.lida).length

  async function load() {
    try {
      const res = await fetch("/api/notificacoes")
      if (res.ok) setNotifs(await res.json())
    } catch {}
  }

  async function markAllRead() {
    await fetch("/api/notificacoes/ler", { method: "POST" })
    setNotifs((prev) => prev.map((n) => ({ ...n, lida: true })))
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!open) return
    function handleClose(e: MouseEvent | KeyboardEvent) {
      if (e instanceof KeyboardEvent) {
        if (e.key === "Escape") setOpen(false)
        return
      }
      const target = e.target as Node
      if (buttonRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener("mousedown", handleClose)
    document.addEventListener("keydown", handleClose)
    return () => {
      document.removeEventListener("mousedown", handleClose)
      document.removeEventListener("keydown", handleClose)
    }
  }, [open])

  function toggle() {
    if (open) {
      setOpen(false)
      return
    }
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const dropdownWidth = 320
      const left = Math.max(8, Math.min(rect.right - dropdownWidth, window.innerWidth - dropdownWidth - 8))
      setPos({ top: rect.bottom + 6, left })
    }
    setOpen(true)
    if (unread > 0) markAllRead()
  }

  return (
    <>
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        onClick={toggle}
        title="Notificações"
        className="relative"
      >
        {unread > 0 ? <BellDot className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Button>

      {open && pos && (
        <div
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[200] w-80 rounded-xl bg-popover shadow-lg ring-1 ring-foreground/10 overflow-hidden"
        >
          <div className="flex items-center justify-between border-b px-4 py-3">
            <span className="text-sm font-medium">Notificações</span>
            {notifs.some((n) => !n.lida) && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <CheckCheck className="h-3 w-3" />
                Marcar lidas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <Bell className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">Sem notificações</p>
              </div>
            ) : (
              notifs.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 border-b last:border-0 transition-colors",
                    !n.lida ? "bg-primary/5" : "hover:bg-muted/40"
                  )}
                >
                  <span className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    n.tipo === "VENCIDO"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-alerta/10 text-alerta"
                  )}>
                    {n.tipo === "VENCIDO"
                      ? <AlertCircle className="h-3.5 w-3.5" />
                      : <Clock className="h-3.5 w-3.5" />
                    }
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium leading-snug">{n.titulo}</p>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">{n.mensagem}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {format(new Date(n.createdAt), "dd/MM HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  )
}
