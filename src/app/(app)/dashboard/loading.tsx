import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      <Bone className="h-8 w-40" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Bone className="mb-2 h-4 w-24" />
              <Bone className="h-7 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><Bone className="h-5 w-36" /></CardHeader>
          <CardContent><Bone className="h-[280px] w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><Bone className="h-5 w-28" /></CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Bone key={i} className="h-10 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
