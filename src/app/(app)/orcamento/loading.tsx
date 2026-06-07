import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function OrcamentoLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Bone className="h-8 w-32" />
          <Bone className="h-4 w-52" />
        </div>
        <Bone className="h-8 w-40" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-card ring-1 ring-foreground/10 p-3 space-y-1.5">
            <Bone className="mx-auto h-3 w-20" />
            <Bone className="mx-auto h-5 w-24" />
          </div>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
            <div className="flex justify-between">
              <div className="space-y-1">
                <Bone className="h-4 w-28" />
                <Bone className="h-3 w-20" />
              </div>
              <Bone className="h-6 w-12" />
            </div>
            <Bone className="h-1.5 w-full" />
            <div className="flex justify-between">
              <Bone className="h-3 w-24" />
              <Bone className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
