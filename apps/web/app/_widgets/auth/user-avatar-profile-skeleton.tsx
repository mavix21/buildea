import { Skeleton } from "@buildea/ui/components/skeleton";

export function UserAvatarProfileSkeleton() {
  return (
    <div className="flex w-full items-center gap-2">
      <Skeleton className="size-8 rounded-md" />

      <div className="grid flex-1 gap-1.5 text-left">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-2 w-full" />
      </div>
    </div>
  );
}
