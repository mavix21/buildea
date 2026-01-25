import { Suspense } from "react";

import { api } from "@buildea/convex/_generated/api";
import { isAuthError } from "@buildea/convex/errors";

import { preloadAuthQuery } from "@/auth/server";
import { redirect } from "@/shared/i18n";
import PageContainer from "@/shared/ui/page-container";

import { OrganizationsPageClient } from "./organizations-page-client";
import { OrganizationsTableSkeleton } from "./organizations-table-skeleton";

async function OrganizationsContent() {
  let preloadedOrganizations;

  try {
    preloadedOrganizations = await preloadAuthQuery(
      api.admin.listOrganizations,
      {},
    );
  } catch (error) {
    if (isAuthError(error)) {
      redirect({ href: "/login", locale: "es" });
    }
    console.error("Error loading organizations:", error);
    throw error; // Rethrow or handle as needed
  }

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
