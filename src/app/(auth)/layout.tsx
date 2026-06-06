export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dark relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "oklch(0.08 0.015 277)" }}
    >
      <div
        className="pointer-events-none absolute -left-48 -top-48 h-[600px] w-[600px] rounded-full blur-[140px]"
        style={{ background: "oklch(0.52 0.233 277 / 0.18)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-48 -right-48 h-[500px] w-[500px] rounded-full blur-[140px]"
        style={{ background: "oklch(0.60 0.17 162 / 0.12)" }}
      />
      <div className="relative z-10 w-full max-w-md px-4 py-12">{children}</div>
    </div>
  )
}
