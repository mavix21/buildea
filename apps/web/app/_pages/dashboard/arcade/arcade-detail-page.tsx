import { Suspense } from "react";

import { api } from "@buildea/convex/_generated/api";

import { preloadAuthQuery } from "@/auth/server";
import PageContainer from "@/shared/ui/page-container";

import { ArcadeDetail } from "./ui/arcade-detail";
import { ArcadeDetailSkeleton } from "./ui/arcade-detail-skeleton";

interface ArcadeDetailPageProps {
  slug: string;
}

export function ArcadeDetailPage({ slug }: ArcadeDetailPageProps) {
  return (
    <PageContainer className="space-y-8">
      <Suspense fallback={<ArcadeDetailSkeleton />}>
        <ArcadeDetailLoader slug={slug} />
      </Suspense>
    </PageContainer>
  );
}

async function ArcadeDetailLoader({ slug }: { slug: string }) {
  const preloadedArcade = await preloadAuthQuery(api.arcades.getBySlug, {
    slug,
  });
  return <ArcadeDetail preloaded={preloadedArcade} />;
}
