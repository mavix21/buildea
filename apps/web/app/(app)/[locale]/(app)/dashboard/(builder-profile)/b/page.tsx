import { Suspense } from "react";
import { redirect } from "next/navigation";

import { api } from "@buildea/convex/_generated/api";

import { fetchAuthQuery, isAuthenticated } from "@/auth/server";
import { ProfileSkeleton } from "@/pages/dashboard/builder-profile/ui";
import PageContainer from "@/shared/ui/page-container";

interface Props {
  params: Promise<{ locale: string }>;
}

export default function BuilderProfileRedirectPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <ProfileSkeleton />
        </PageContainer>
      }
    >
      <RedirectHandler params={params} />
    </Suspense>
  );
}

async function RedirectHandler({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<never> {
  const { locale } = await params;
  const authed = await isAuthenticated();

  if (!authed) {
    redirect(`/${locale}/login`);
  }

  // Get current user to redirect to their profile
  const user = await fetchAuthQuery(api.auth.getCurrentUser, {});
  const identifier = user.username ?? user.id;

  redirect(`/${locale}/dashboard/b/${identifier}`);
}
