export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="dark min-h-screen flex items-center justify-center"
      style={{ background: "oklch(0.08 0.015 277)" }}
    >
      <div className="w-full max-w-md px-4 py-12">{children}</div>
    </div>
  )
}
