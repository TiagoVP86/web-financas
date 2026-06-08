import type { Metadata } from "next"
import { Manrope, Newsreader } from "next/font/google"
import "./globals.css"
import { Providers } from "@/components/providers"
import { Toaster } from "sonner"

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
})

const newsreader = Newsreader({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  title: "Finanças+",
  description: "Controle financeiro pessoal",
  icons: {
    icon: [
      { url: "/assets/icon/icon-grafico.svg", type: "image/svg+xml" },
      { url: "/assets/icon/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/icon/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: { url: "/assets/icon/apple-touch-icon-180.png", sizes: "180x180" },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${manrope.variable} ${newsreader.variable}`}>
      <body>
        <Providers>
          {children}
          <Toaster richColors />
        </Providers>
      </body>
    </html>
  )
}
