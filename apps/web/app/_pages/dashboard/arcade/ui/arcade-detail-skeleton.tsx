import { Skeleton } from "@buildea/ui/components/skeleton";

export function ArcadeDetailSkeleton() {
  return (
    <div className="space-y-8">
      {/* Back link skeleton */}
      <Skeleton className="h-5 w-32" />

      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        <Skeleton className="aspect-video w-full rounded-xl md:w-80" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-5 w-32" />
        </div>
      </div>

      {/* Levels Grid */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-20" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <LevelCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

function LevelCardSkeleton() {
  return (
    <div className="border-border/50 flex flex-col items-center gap-4 rounded-xl border p-6">
      {/* Banner skeleton */}
      <div className="flex flex-col items-center gap-0">
        <Skeleton
          className="size-16"
          style={{
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
        <Skeleton className="-mt-2 h-10 w-8 rounded-none" />
      </div>

      {/* Info skeleton */}
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>

      {/* Button skeleton */}
      <Skeleton className="h-8 w-full" />
    </div>
  );
}
