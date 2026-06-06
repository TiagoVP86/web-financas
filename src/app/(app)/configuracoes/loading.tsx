import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function ConfiguracoesLoading() {
  return (
    <div className="max-w-2xl space-y-6">
      <div className="space-y-1">
        <Bone className="h-8 w-36" />
        <Bone className="h-4 w-56" />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bone className="h-8 w-8 rounded-full" />
          <Bone className="h-5 w-16" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Bone className="h-9 w-full" />
          <Bone className="h-9 w-full" />
          <Bone className="h-9 w-full" />
          <Bone className="h-9 w-28" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <Bone className="h-8 w-8 rounded-full" />
          <Bone className="h-5 w-24" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Bone key={i} className="h-10 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
