import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function LancamentosLoading() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Bone className="h-8 w-36" />
        <Bone className="h-9 w-32" />
      </div>
      <div className="flex gap-2">
        <Bone className="h-9 w-28" />
        <Bone className="h-9 w-24" />
        <Bone className="h-9 w-24" />
      </div>
      <Card>
        <CardHeader><Bone className="h-5 w-32" /></CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Bone key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
