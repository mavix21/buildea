"use client";

import type { Preloaded } from "convex/react";
import type { ReactNode } from "react";
import { use } from "react";
import { usePreloadedQuery } from "convex/react";

import type { api } from "@buildea/convex/_generated/api";
import { Card, CardContent } from "@buildea/ui/components/card";

import { AchievementsCard } from "./achievements-card";
import { ProfileHeader } from "./profile-header";
import { ProfileStats } from "./profile-stats";
import { ProfileTabs } from "./profile-tabs";
import { SkillsCard } from "./skills-card";

type ProfileData = NonNullable<
  Awaited<
    ReturnType<
      typeof usePreloadedQuery<
        typeof api.builderProfile.getBuilderProfileByIdentifier
      >
    >
  >
>;

interface ProfileContentProps {
  preloadedProfile: Promise<
    Preloaded<typeof api.builderProfile.getBuilderProfileByIdentifier>
  >;
  notFoundFallback: ReactNode;
}

export function ProfileContent({
  preloadedProfile,
  notFoundFallback,
}: ProfileContentProps) {
  const preloaded = use(preloadedProfile);
  const profile = usePreloadedQuery(preloaded);

  if (!profile) {
    return notFoundFallback;
  }

  return <ProfileLayout profile={profile} />;
}

function ProfileLayout({ profile }: { profile: ProfileData }) {
  return (
    <div className="grid w-full grid-cols-1 gap-8 lg:grid-cols-[minmax(0px,2.1fr)_minmax(0px,1fr)]">
      <div className="space-y-6">
        <ProfileHeader
          name={profile.name}
          username={profile.username}
          avatarUrl={profile.avatarUrl}
          bannerUrl={profile.bannerUrl}
          socials={profile.socials}
          countryCode={profile.countryCode}
          joinedAt={profile.joinedAt}
          followersCount={profile.followersCount}
          followingCount={profile.followingCount}
          isOwnProfile={profile.isOwnProfile}
        />
        <ProfileTabs
          overviewContent={<OverviewTab profile={profile} />}
          projectsContent={<ProjectsPlaceholder />}
          postsContent={<PostsPlaceholder />}
        />
      </div>

      <div className="space-y-6">
        <ProfileStats
          name={profile.name}
          username={profile.username}
          avatarUrl={profile.avatarUrl}
          level={profile.level}
          xp={profile.xp}
          rank={profile.rank}
          badgesCount={profile.badgesCount}
          dayStreak={profile.dayStreak}
        />
        <AchievementsCard />
        <SkillsCard skills={profile.skills} />
      </div>
    </div>
  );
}

function OverviewTab({ profile: _profile }: { profile: ProfileData }) {
  return (
    <div className="space-y-6">
      <ProjectsPlaceholder />
      <PostsPlaceholder />
    </div>
  );
}

function ProjectsPlaceholder() {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Aún no tienes proyectos. Agrega uno al{" "}
          <span className="text-primary underline">Project Showcase</span>.
        </p>
      </CardContent>
    </Card>
  );
}

function PostsPlaceholder() {
  return (
    <Card>
      <CardContent className="py-8 text-center">
        <p className="text-muted-foreground text-sm">
          Aún no has publicado nada. ¿Por qué no saludas en{" "}
          <span className="text-primary underline">#introductions</span>?
        </p>
      </CardContent>
    </Card>
  );
}
