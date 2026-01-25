import { Suspense } from "react";

import { api } from "@buildea/convex/_generated/api";

import { preloadAuthQuery } from "@/auth/server";
import PageContainer from "@/shared/ui/page-container";

import { OrganizationsPageClient } from "./organizations-page-client";
import { OrganizationsTableSkeleton } from "./organizations-table-skeleton";

async function OrganizationsContent() {
  const preloadedOrganizations = await preloadAuthQuery(
    api.admin.listOrganizations,
    {},
  );

  return (
    <OrganizationsPageClient preloadedOrganizations={preloadedOrganizations} />
  );
}

export function OrganizationsPage() {
  return (
    <PageContainer
      pageTitle="Organizaciones"
      pageDescription="Gestiona todas las organizaciones en el sistema"
    >
      <Suspense fallback={<OrganizationsTableSkeleton />}>
        <OrganizationsContent />
      </Suspense>
    </PageContainer>
  );
}
