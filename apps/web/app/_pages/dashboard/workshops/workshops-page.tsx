import { Suspense } from "react";
import { useTranslations } from "next-intl";

import { api } from "@buildea/convex/_generated/api";

import { preloadAuthQuery } from "@/auth/server";
import PageContainer from "@/shared/ui/page-container";

import {
  WorkshopsDiscovery,
  WorkshopsDiscoveryShell,
} from "./ui/workshops-discovery";
import { WorkshopsDiscoverySkeleton } from "./ui/workshops-discovery-skeleton";

const PAGE_SIZE = 12;

export function WorkshopsPage() {
  const t = useTranslations("workshops");

  return (
    <PageContainer
      scrollable={false}
      className="flex h-full min-h-0 flex-col gap-6 overflow-hidden"
      pageTitle={t("header.title")}
      pageDescription={t("header.description")}
    >
      <WorkshopsDiscoveryShell>
        <Suspense fallback={<WorkshopsDiscoverySkeleton />}>
          <WorkshopsDiscoveryLoader />
        </Suspense>
      </WorkshopsDiscoveryShell>
    </PageContainer>
  );
}

async function WorkshopsDiscoveryLoader() {
  const preloadedUpcoming = await preloadAuthQuery(api.workshops.listUpcoming, {
    paginationOpts: {
      numItems: PAGE_SIZE,
      cursor: null,
    },
  });

  return <WorkshopsDiscovery preloadedUpcoming={preloadedUpcoming} />;
}
