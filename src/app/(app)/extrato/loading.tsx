import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function ExtratoLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bone className="h-11 w-11 rounded-full" />
        <div className="space-y-1">
          <Bone className="h-7 w-52" />
          <Bone className="h-4 w-80" />
        </div>
      </div>
      <Bone className="h-40 w-full rounded-xl" />
    </div>
  )
}
