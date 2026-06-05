import { Sidebar } from "@/components/layout/sidebar"
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-background p-6 pt-20 md:pt-6">
        {children}
      </main>
    </div>
  )
}
