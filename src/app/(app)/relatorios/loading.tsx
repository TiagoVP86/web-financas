import { Card, CardContent, CardHeader } from "@/components/ui/card"

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function RelatoriosLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBlock className="h-8 w-32" />
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-28" />
          <SkeletonBlock className="h-9 w-20" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><SkeletonBlock className="h-5 w-40" /></CardHeader>
          <CardContent><SkeletonBlock className="h-[220px] w-full" /></CardContent>
        </Card>
        <Card>
          <CardHeader><SkeletonBlock className="h-5 w-56" /></CardHeader>
          <CardContent><SkeletonBlock className="h-[280px] w-full" /></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><SkeletonBlock className="h-5 w-48" /></CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-9 w-full" />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
