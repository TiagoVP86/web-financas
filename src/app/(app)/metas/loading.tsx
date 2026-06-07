function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function MetasLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <Bone className="h-8 w-24" />
          <Bone className="h-4 w-64" />
        </div>
        <Bone className="h-9 w-28" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
            <Bone className="h-1.5 w-full rounded-none" />
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Bone className="h-7 w-7 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Bone className="h-4 w-3/4" />
                  <Bone className="h-3 w-1/2" />
                </div>
              </div>
              <Bone className="h-2 w-full" />
              <div className="flex justify-between">
                <Bone className="h-3 w-28" />
                <Bone className="h-3 w-8" />
              </div>
              <div className="flex justify-between items-center">
                <Bone className="h-3 w-24" />
                <Bone className="h-7 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
