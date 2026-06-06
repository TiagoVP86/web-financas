import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function IaLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bone className="h-11 w-11 rounded-full" />
        <div className="space-y-1">
          <Bone className="h-7 w-48" />
          <Bone className="h-4 w-72" />
        </div>
      </div>
      <Card>
        <CardHeader><Bone className="h-5 w-40" /></CardHeader>
        <CardContent className="space-y-3">
          <Bone className="h-24 w-full" />
          <Bone className="h-9 w-32" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader><Bone className="h-5 w-36" /></CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bone key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
