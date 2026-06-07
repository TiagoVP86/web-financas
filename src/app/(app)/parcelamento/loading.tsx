function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function ParcelamentoLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Bone className="h-8 w-44" />
          <Bone className="h-4 w-64" />
        </div>
        <Bone className="h-9 w-20" />
      </div>
      <div className="space-y-3">
        <Bone className="h-4 w-28" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
              <div className="flex justify-between">
                <div className="space-y-1">
                  <Bone className="h-4 w-36" />
                  <Bone className="h-3 w-20" />
                </div>
                <Bone className="h-5 w-10" />
              </div>
              <Bone className="h-1.5 w-full" />
              <div className="space-y-1">
                <div className="flex justify-between">
                  <Bone className="h-3 w-20" />
                  <Bone className="h-3 w-24" />
                </div>
                <Bone className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
