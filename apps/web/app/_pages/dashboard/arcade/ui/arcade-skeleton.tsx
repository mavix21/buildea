import { Skeleton } from "@buildea/ui/components/skeleton";

export function ArcadeListSkeleton() {
  return (
    <div className="grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <ArcadeCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ArcadeCardSkeleton() {
  return (
    <div className="border-border/50 bg-card flex flex-col overflow-hidden rounded-lg border">
      <Skeleton className="aspect-video w-full rounded-none" />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />

        {/* Level Banner Skeletons */}
        <div className="mt-auto flex items-start gap-3 pt-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-0">
              <Skeleton
                className="size-11"
                style={{
                  clipPath:
                    "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}
              />
              <Skeleton className="-mt-1 h-7 w-6 rounded-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
