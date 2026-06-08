import { db } from "@/lib/db"
import { addDays, startOfDay } from "date-fns"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })

async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) return
  try {
    const { Resend } = await import("resend")
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Finanças+ <noreply@minhasfinancas.app>",
      to,
      subject,
      html,
    })
  } catch {
    // email failure is non-blocking
  }
}

export async function gerarNotificacoes(userId?: string) {
  const where = userId ? { id: userId } : {}
  const users = await db.user.findMany({
    where,
    select: { id: true, name: true, email: true, notifDias: true },
  })

  for (const user of users) {
    const hoje = startOfDay(new Date())
    const limite = addDays(hoje, user.notifDias)

    // Bills coming due within notifDias days (still PENDENTE)
    const proximos = await db.lancamento.findMany({
      where: {
        userId: user.id,
        status: "PENDENTE",
        data: { gte: hoje, lte: limite },
      },
      select: { id: true, descricao: true, valor: true, data: true },
    })

    // Overdue bills (PENDENTE past today — these haven't been auto-set to VENCIDO yet)
    const vencidos = await db.lancamento.findMany({
      where: {
        userId: user.id,
        status: { in: ["PENDENTE", "VENCIDO"] },
        data: { lt: hoje },
      },
      select: { id: true, descricao: true, valor: true, data: true },
    })

    // Deduplicate: skip if notification already exists for this lancamento+tipo
    const existingProximos = await db.notificacao.findMany({
      where: { userId: user.id, tipo: "VENCIMENTO_PROXIMO", lancamentoId: { in: proximos.map((l) => l.id) } },
      select: { lancamentoId: true },
    })
    const existingVencidos = await db.notificacao.findMany({
      where: { userId: user.id, tipo: "VENCIDO", lancamentoId: { in: vencidos.map((l) => l.id) } },
      select: { lancamentoId: true },
    })

    const alreadyProximo = new Set(existingProximos.map((n) => n.lancamentoId))
    const alreadyVencido = new Set(existingVencidos.map((n) => n.lancamentoId))

    const newProximos = proximos.filter((l) => !alreadyProximo.has(l.id))
    const newVencidos = vencidos.filter((l) => !alreadyVencido.has(l.id))

    // Insert new notifications
    if (newProximos.length > 0) {
      await db.notificacao.createMany({
        data: newProximos.map((l) => ({
          userId: user.id,
          tipo: "VENCIMENTO_PROXIMO" as const,
          lancamentoId: l.id,
          titulo: "Vencimento próximo",
          mensagem: `${l.descricao} · ${fmt(Number(l.valor))} · vence em ${format(new Date(l.data), "dd/MM", { locale: ptBR })}`,
        })),
      })
    }

    if (newVencidos.length > 0) {
      await db.notificacao.createMany({
        data: newVencidos.map((l) => ({
          userId: user.id,
          tipo: "VENCIDO" as const,
          lancamentoId: l.id,
          titulo: "Conta vencida",
          mensagem: `${l.descricao} · ${fmt(Number(l.valor))} · venceu em ${format(new Date(l.data), "dd/MM", { locale: ptBR })}`,
        })),
      })
    }

    // Send summary email if there's anything new
    const total = newProximos.length + newVencidos.length
    if (total > 0) {
      const rows = [
        ...newVencidos.map((l) => `<tr><td style="color:#ef4444">Vencida</td><td>${l.descricao}</td><td>${fmt(Number(l.valor))}</td><td>${format(new Date(l.data), "dd/MM/yyyy", { locale: ptBR })}</td></tr>`),
        ...newProximos.map((l) => `<tr><td style="color:#f97316">Próxima</td><td>${l.descricao}</td><td>${fmt(Number(l.valor))}</td><td>${format(new Date(l.data), "dd/MM/yyyy", { locale: ptBR })}</td></tr>`),
      ].join("")

      const html = `
        <p>Olá${user.name ? `, ${user.name}` : ""}!</p>
        <p>Você tem <strong>${total} conta${total !== 1 ? "s" : ""}</strong> que precisam de atenção:</p>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%">
          <thead><tr><th>Situação</th><th>Descrição</th><th>Valor</th><th>Vencimento</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <p><a href="${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/lancamentos">Ver lançamentos</a></p>
      `
      await sendEmail(user.email, `Finanças+ — ${total} conta${total !== 1 ? "s" : ""} pendente${total !== 1 ? "s" : ""}`, html)
    }
  }
}
