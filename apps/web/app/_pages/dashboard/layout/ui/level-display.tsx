"use client";

import { use } from "react";
import { usePreloadedQuery } from "convex/react";

import type { api } from "@buildea/convex/_generated/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@buildea/ui/components/tooltip";

import type { preloadAuthQuery } from "@/auth/server";

interface LevelDisplayProps {
  levelInfoPromise: ReturnType<
    typeof preloadAuthQuery<typeof api.xp.getUserLevelInfo>
  >;
}

export function LevelDisplay({ levelInfoPromise }: LevelDisplayProps) {
  const preloadedLevelInfo = use(levelInfoPromise);
  const levelInfo = usePreloadedQuery(preloadedLevelInfo);

  let progressPercent =
    levelInfo.xpForNextLevel > 0
      ? Math.min((levelInfo.currentXp / levelInfo.xpForNextLevel) * 100, 100)
      : 0;
  if (progressPercent === 0) progressPercent += 4; // Ensure some minimal visibility

  return (
    <div className="flex items-center gap-3">
      {/* Progress bar with tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex w-28 cursor-default flex-col gap-1">
            {/* Progress bar container */}
            <div className="bg-background relative flex h-6 w-full items-center rounded-full border p-1">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                {/* Track background */}
                <div className="bg-border absolute inset-0 rounded-full" />
                {/* Progress fill with gradient */}
                <div
                  className="relative z-10 h-full bg-linear-to-r from-amber-600 via-amber-400 to-amber-300 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="font-mono text-sm">
          {levelInfo.currentXp} / {levelInfo.xpForNextLevel} XP
        </TooltipContent>
      </Tooltip>

      {/* Level info */}
      <div className="flex flex-col items-start text-sm">
        <span className="text-muted-foreground font-medium">
          {levelInfo.title ?? "No Role"}
        </span>
        <span className="text-muted-foreground/70 text-xs">
          Level {levelInfo.level}
        </span>
      </div>
    </div>
  );
}

export function LevelDisplaySkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3">
      <div className="bg-muted h-6 w-28 rounded-full" />
      <div className="flex flex-col gap-1">
        <div className="bg-muted h-4 w-16 rounded" />
        <div className="bg-muted h-3 w-12 rounded" />
      </div>
    </div>
  );
}
