import { Skeleton } from "@buildea/ui/components/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="grid w-full grid-cols-1 gap-10 lg:grid-cols-[minmax(0px,2.4fr)_minmax(0px,1fr)]">
      <div className="space-y-6">
        {/* Banner skeleton */}
        <Skeleton className="h-48 w-full rounded-lg" />

        <div className="relative space-y-4 px-4">
          {/* Avatar skeleton - overlapping banner */}
          <div className="-mt-23 flex items-end gap-4">
            <Skeleton className="border-background size-32 rounded-full border-4" />
          </div>

          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="space-y-6">
            {/* Tabs skeleton */}
            <Skeleton className="h-10 w-64" />
            {/* Projects placeholder skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            {/* Posts placeholder skeleton */}
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
          {/* Stats row skeleton */}
          <div className="mt-4 flex gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </div>
      <div className="grid">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats card skeleton */}
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-5 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>

          {/* Achievements skeleton */}
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>

          {/* Skills skeleton */}
          <div className="space-y-3 rounded-lg border p-4">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-9 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
