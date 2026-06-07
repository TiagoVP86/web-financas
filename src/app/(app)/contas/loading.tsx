function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function ContasLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Bone className="h-8 w-28" />
        <Bone className="h-4 w-48" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Bone className="h-10 w-10 rounded-xl" />
              <div className="space-y-1 flex-1">
                <Bone className="h-4 w-28" />
                <Bone className="h-3 w-20" />
              </div>
            </div>
            <div className="border-t border-border/50 pt-3 space-y-1">
              <Bone className="h-3 w-16" />
              <Bone className="h-6 w-32" />
            </div>
            <div className="flex justify-between">
              <Bone className="h-3 w-20" />
              <Bone className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
