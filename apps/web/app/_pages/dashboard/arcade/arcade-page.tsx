import { Suspense } from "react";

import { api } from "@buildea/convex/_generated/api";

import { preloadAuthQuery } from "@/auth/server";
import PageContainer from "@/shared/ui/page-container";

import { ArcadeList } from "./ui/arcade-list";
import { ArcadeListSkeleton } from "./ui/arcade-skeleton";

export function ArcadePage() {
  return (
    <PageContainer className="space-y-12">
      {/* Hero Banner (static, renders immediately) */}
      <div className="bg-muted flex h-80 items-center justify-center bg-[url(/arcade/arcade-hero.jpg)] bg-cover bg-center bg-no-repeat" />

      {/* All Arcades Section */}
      <section className="space-y-6">
        <h2 className="font-pixel text-wrap-balance text-xl">All Arcades</h2>

        <Suspense fallback={<ArcadeListSkeleton />}>
          <ArcadeListLoader />
        </Suspense>
      </section>
    </PageContainer>
  );
}

async function ArcadeListLoader() {
  const preloadedArcades = await preloadAuthQuery(api.arcades.list);
  return <ArcadeList preloaded={preloadedArcades} />;
}
