import { Card, CardContent, CardHeader } from "@/components/ui/card"

function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function EditarLancamentoLoading() {
  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader><Bone className="h-6 w-40" /></CardHeader>
        <CardContent className="space-y-4">
          <Bone className="h-9 w-full" />
          <div className="grid grid-cols-2 gap-3">
            <Bone className="h-9 w-full" />
            <Bone className="h-9 w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Bone className="h-9 w-full" />
            <Bone className="h-9 w-full" />
          </div>
          <Bone className="h-9 w-full" />
          <Bone className="h-9 w-full" />
          <Bone className="h-9 w-full" />
          <div className="flex gap-2">
            <Bone className="h-9 flex-1" />
            <Bone className="h-9 flex-1" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
