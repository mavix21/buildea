import { Suspense } from "react";

import { api } from "@buildea/convex/_generated/api";
import { Separator } from "@buildea/ui/components/separator";
import { SidebarTrigger } from "@buildea/ui/components/sidebar";
import { Skeleton } from "@buildea/ui/components/skeleton";

import { preloadAuthQuery } from "@/auth/server";
import { ModeToggle } from "@/shared/ui";

import { LevelDisplay, LevelDisplaySkeleton } from "./level-display";
import { HeaderUserMenu } from "./user-menu";

export default function Header() {
  const levelInfoPromise = preloadAuthQuery(api.xp.getUserLevelInfo);
  const currentUserPromise = preloadAuthQuery(api.auth.getCurrentUserClient);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>

      <div className="flex items-center gap-4 px-4">
        <Suspense fallback={<LevelDisplaySkeleton />}>
          <LevelDisplay levelInfoPromise={levelInfoPromise} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-8 w-8 rounded-full" />}>
          <HeaderUserMenu currentUserPromise={currentUserPromise} />
        </Suspense>
        <ModeToggle />
      </div>
    </header>
  );
}
