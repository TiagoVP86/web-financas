import nodemailer from "nodemailer"

const BASE_URL = process.env.NEXTAUTH_URL ?? "http://localhost:3000"

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function createTransporter() {
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export async function sendVerificationEmail(to: string, name: string, token: string) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return

  const url = escapeHtml(`${BASE_URL}/verificar-email?token=${token}`)
  const firstName = escapeHtml(name.split(" ")[0])
  const from = process.env.EMAIL_FROM ?? `Web Finanças <${process.env.GMAIL_USER}>`

  try {
    const transporter = createTransporter()
    await transporter.sendMail({
      from,
      to,
      subject: "Confirme seu cadastro no Web Finanças",
      html: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Confirme seu email</title>
</head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:Inter,system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e5e5;">
          <tr>
            <td style="background:#3730a3;padding:28px 40px;">
              <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;letter-spacing:-0.01em;">Web Finanças</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111111;line-height:1.2;">Olá, ${firstName}</p>
              <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.6;">
                Seu cadastro foi criado. Clique no botão abaixo para confirmar seu email e acessar sua conta.
              </p>
              <a href="${url}" style="display:inline-block;background:#4f46e5;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:12px 28px;border-radius:8px;">
                Confirmar email
              </a>
              <p style="margin:28px 0 0;font-size:13px;color:#888888;line-height:1.6;">
                Ou cole este link no navegador:<br />
                <a href="${url}" style="color:#4f46e5;word-break:break-all;">${url}</a>
              </p>
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:28px 0;" />
              <p style="margin:0;font-size:12px;color:#aaaaaa;">
                Se você não criou esta conta, ignore este email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
    })
  } catch {
    // non-blocking
  }
}
