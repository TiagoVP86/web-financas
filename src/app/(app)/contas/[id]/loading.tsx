function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className ?? ""}`} />
}

export default function ContaDetalheLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Bone className="h-4 w-28" />
        <Bone className="h-8 w-48" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 space-y-2">
            <Bone className="h-3 w-20" />
            <Bone className="h-6 w-28" />
          </div>
        ))}
      </div>
      <Bone className="h-60 w-full rounded-xl" />
      <Bone className="h-72 w-full rounded-xl" />
    </div>
  )
}
