import { Card, CardContent } from "@/components/ui/card"

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function RecorrenciasLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <Bone className="h-8 w-36" />
          <Bone className="h-4 w-64" />
        </div>
        <div className="flex gap-2">
          <Bone className="h-9 w-36" />
          <Bone className="h-9 w-20" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-start gap-3">
                <Bone className="h-9 w-9 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Bone className="h-4 w-32" />
                  <Bone className="h-6 w-24" />
                </div>
              </div>
              <Bone className="h-4 w-full" />
              <Bone className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
