import Image from "next/image";
import { IconEdit } from "@tabler/icons-react";
import { countries } from "country-data-list";
import { CircleFlag } from "react-circle-flags";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@buildea/ui/components/avatar";
import { Button } from "@buildea/ui/components/button";

import type { Socials } from "@/entities/profile/model/socials";
import { socialFields, SocialIcons } from "@/entities/profile/model/socials";
import { Link } from "@/shared/i18n";

interface ProfileHeaderProps {
  name: string;
  username: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  socials: Socials;
  joinedAt: number;
  followersCount: number;
  followingCount: number;
  countryCode: string | null;
  /** Whether the current authenticated user is viewing their own profile */
  isOwnProfile: boolean;
}

export function ProfileHeader({
  name,
  username,
  avatarUrl,
  bannerUrl,
  socials,
  followersCount,
  followingCount,
  isOwnProfile,
  countryCode,
}: ProfileHeaderProps) {
  // const joinDate = new Date(joinedAt);
  // const formattedJoinDate = joinDate.toLocaleDateString("es-ES", {
  //   month: "short",
  //   year: "numeric",
  // });

  return (
    <div className="flex flex-col">
      {/* Banner */}
      <div className="relative h-48 w-full overflow-hidden rounded-lg">
        <Image
          src={bannerUrl ?? "/profile/profile-hero-default.jpg"}
          alt="Profile banner"
          fill
          className="h-full w-full object-cover"
        />
      </div>

      {/* Profile info section */}
      <div className="relative px-4">
        {/* Avatar - overlapping banner */}
        <div className="-mt-16 flex items-end justify-between gap-4">
          <Avatar className="border-background h-32 w-32 border-4 text-4xl">
            <AvatarImage src={avatarUrl ?? undefined} alt={name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
              {name.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <Button className="mb-1" asChild>
              <Link href="/dashboard/account/profile">
                <IconEdit className="size-5" />
                <span>Editar perfil</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Meta info row */}
        <div className="text-muted-foreground mt-3 flex flex-wrap gap-4 text-sm">
          <div className="mb-2 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-foreground text-2xl font-bold">{name}</h1>
              {countryCode && (
                <CircleFlag
                  countryCode={(
                    (countryCode.length === 3
                      ? countries.all.find((c) => c.alpha3 === countryCode)
                          ?.alpha2
                      : countryCode) ?? ""
                  ).toLowerCase()}
                  height="24"
                  width="24"
                />
              )}
            </div>
            {username && (
              <p className="text-muted-foreground text-sm">@{username}</p>
            )}
          </div>
          <div className="mt-1.5 flex gap-1">
            {/*<IconCalendar className="h-4 w-4" />
            <span>Se unió en {formattedJoinDate}</span>*/}
            {Object.entries(socials).map(([social, value]) => {
              if (!value) {
                return null;
              }
              const socialTyped = social as keyof typeof SocialIcons;

              const Icon = SocialIcons[socialTyped];
              return (
                <Button size="icon" variant="ghost" key={social} asChild>
                  <a
                    href={`${socialFields[socialTyped].prefix}${value}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    title={social}
                  >
                    <Icon className="size-5" />
                  </a>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Followers/Following */}
        <div className="mt-2 flex gap-4 text-sm">
          <span>
            <span className="font-semibold">{followersCount}</span>{" "}
            <span className="text-muted-foreground">Seguidores</span>
          </span>
          <span>
            <span className="font-semibold">{followingCount}</span>{" "}
            <span className="text-muted-foreground">Siguiendo</span>
          </span>
        </div>
      </div>
    </div>
  );
}
