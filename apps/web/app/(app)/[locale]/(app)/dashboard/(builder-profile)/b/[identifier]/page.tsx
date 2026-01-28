import { Suspense } from "react";
import { preloadQuery } from "convex/nextjs";

import { api } from "@buildea/convex/_generated/api";

import {
  ProfileContent,
  ProfileNotFound,
  ProfileSkeleton,
} from "@/pages/dashboard/builder-profile/ui";
import PageContainer from "@/shared/ui/page-container";

interface Props {
  params: Promise<{ identifier: string; locale: string }>;
}

export default function BuilderProfilePage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <ProfileSkeleton />
        </PageContainer>
      }
    >
      <ProfileLoader params={params} />
    </Suspense>
  );
}

async function ProfileLoader({
  params,
}: {
  params: Promise<{ identifier: string; locale: string }>;
}) {
  const { identifier } = await params;

  const preloadedProfile = preloadQuery(
    api.queries.builderProfile.getBuilderProfileByIdentifier,
    { identifier },
  );

  return (
    <PageContainer>
      <ProfileContent
        preloadedProfile={preloadedProfile}
        notFoundFallback={<ProfileNotFound />}
      />
    </PageContainer>
  );
}
