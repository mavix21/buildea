"use client";

import type { Preloaded } from "convex/react";
import { usePreloadedQuery } from "convex/react";

import type { api } from "@buildea/convex/_generated/api";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@buildea/ui/components/avatar";

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  preloadedUser: Preloaded<typeof api.auth.getCurrentUserClient>;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  preloadedUser,
}: UserAvatarProfileProps) {
  const user = usePreloadedQuery(preloadedUser);

  return (
    <div className="flex items-center gap-2">
      <Avatar className={className}>
        <AvatarImage src={user.image ?? ""} alt={user.name} />
        <AvatarFallback className="rounded-lg">
          {user.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {showInfo && (
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate font-semibold">{user.name}</span>
          <span className="truncate text-xs">{user.email}</span>
        </div>
      )}
    </div>
  );
}
