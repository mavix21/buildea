import { Card, CardContent } from "@buildea/ui/components/card";
import { Skeleton } from "@buildea/ui/components/skeleton";

export function WorkshopsDiscoverySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, groupIndex) => (
          <section key={groupIndex}>
            <div className="flex items-center gap-2 py-2">
              <Skeleton className="size-2 rounded-full" />
              <Skeleton className="h-4 w-40" />
            </div>

            <div className="border-border ml-1 space-y-4 border-l pb-2 pl-5">
              {Array.from({ length: 2 }).map((__, itemIndex) => (
                <article
                  key={`${String(groupIndex)}-${String(itemIndex)}`}
                  className="relative"
                >
                  <Card className="bg-card py-0">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-[1fr_auto] gap-4">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-6 w-64" />
                          <Skeleton className="h-4 w-48" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="size-24 rounded-xl" />
                      </div>
                    </CardContent>
                  </Card>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="flex justify-center">
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}
