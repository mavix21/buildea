"use client";

import type { Preloaded } from "convex/react";
import Image from "next/image";
import Link from "next/link";
import { usePreloadedQuery } from "convex/react";
import { Lock } from "lucide-react";

import type { api } from "@buildea/convex/_generated/api";
import { cn } from "@buildea/ui/lib/utils";

type ArcadeListData = Preloaded<typeof api.arcades.list>;
type ArcadeItem = ReturnType<
  typeof usePreloadedQuery<typeof api.arcades.list>
>[number];

interface ArcadeListProps {
  preloaded: ArcadeListData;
}

export function ArcadeList({ preloaded }: ArcadeListProps) {
  const arcades = usePreloadedQuery(preloaded);

  return (
    <div className="grid auto-rows-fr grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6">
      {arcades.map((arcade) => (
        <ArcadeCard key={arcade._id} arcade={arcade} />
      ))}
    </div>
  );
}

function ArcadeCard({ arcade }: { arcade: ArcadeItem }) {
  return (
    <Link
      href={`/arcade/${arcade.slug}` as "/arcade"}
      className={cn(
        "group border-border/50 bg-card hover:border-border focus-visible:ring-ring",
        "relative flex flex-col overflow-hidden rounded-lg border transition-all",
        "hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden">
        {arcade.imageUrl ? (
          <Image
            src={arcade.imageUrl}
            alt={arcade.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="bg-muted flex h-full items-center justify-center">
            <span className="text-muted-foreground text-sm">No image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-pixel text-foreground group-hover:text-primary dark:group-hover:text-primary-contrast text-base leading-tight font-semibold">
          {arcade.title}
        </h3>

        <p className="text-muted-foreground line-clamp-2 text-sm">
          {arcade.description}
        </p>

        {/* Level Banners */}
        <div className="mt-auto flex items-start gap-3 pt-4">
          {arcade.levels.map((level) => (
            <LevelBanner key={level._id} level={level} />
          ))}
        </div>
      </div>
    </Link>
  );
}

type LevelItem = ArcadeItem["levels"][number];

const difficultyTheme = {
  easy: {
    primary: "#10b981",
    secondary: "#059669",
    accent: "#34d399",
    bg: "from-emerald-500 to-emerald-700",
    border: "border-emerald-400/60",
    glow: "shadow-emerald-500/40",
  },
  medium: {
    primary: "#3b82f6",
    secondary: "#2563eb",
    accent: "#60a5fa",
    bg: "from-blue-500 to-blue-700",
    border: "border-blue-400/60",
    glow: "shadow-blue-500/40",
  },
  hard: {
    primary: "#f59e0b",
    secondary: "#d97706",
    accent: "#fbbf24",
    bg: "from-amber-500 to-amber-700",
    border: "border-amber-400/60",
    glow: "shadow-amber-500/40",
  },
  insane: {
    primary: "#a855f7",
    secondary: "#9333ea",
    accent: "#c084fc",
    bg: "from-purple-500 to-purple-700",
    border: "border-purple-400/60",
    glow: "shadow-purple-500/40",
  },
} as const;

function LevelBanner({ level }: { level: LevelItem }) {
  const theme = difficultyTheme[level.labelDifficulty];
  const isAvailable = !level.isLocked && !level.isCompleted;
  const isActive = !level.isLocked;

  return (
    <div
      className="relative flex flex-col items-center"
      title={`Level ${level.level} - ${level.labelDifficulty}`}
    >
      {/* Decorative top flourish */}
      <svg
        className={cn(
          "absolute -top-1 h-3 w-8 transition-opacity duration-200",
          isActive ? "opacity-80" : "opacity-30",
        )}
        viewBox="0 0 32 12"
        fill="none"
      >
        <path
          d="M16 0 L12 4 L4 4 L0 8 M16 0 L20 4 L28 4 L32 8"
          stroke={isActive ? theme.accent : "#52525b"}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Hexagon badge */}
      <div className="relative z-10 flex size-11 items-center justify-center">
        {/* Glow */}
        {isActive && (
          <div
            className={cn(
              "absolute inset-0 opacity-50 blur-md",
              `bg-linear-to-b ${theme.bg}`,
            )}
            style={{
              clipPath:
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
          />
        )}

        {/* Main hex */}
        <svg className="absolute inset-0" viewBox="0 0 44 50" fill="none">
          <defs>
            <linearGradient
              id={`grad-${level._id}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={isActive ? theme.accent : "#3f3f46"}
              />
              <stop
                offset="100%"
                stopColor={isActive ? theme.secondary : "#27272a"}
              />
            </linearGradient>
          </defs>
          <path
            d="M22 2 L42 14 L42 36 L22 48 L2 36 L2 14 Z"
            fill={`url(#grad-${level._id})`}
            stroke={isActive ? theme.primary : "#52525b"}
            strokeWidth="2"
          />
          {/* Inner highlight */}
          <path
            d="M22 6 L38 16 L38 34 L22 44 L6 34 L6 16 Z"
            fill="none"
            stroke={isActive ? theme.accent : "#3f3f46"}
            strokeWidth="0.5"
            opacity="0.5"
          />
        </svg>

        {/* Icon/number */}
        <div className="relative z-10 flex items-center justify-center">
          {level.isLocked && !level.isCompleted && (
            <Lock className="size-4 text-zinc-500" />
          )}
          {level.isCompleted && (
            <span className="text-base font-bold text-white drop-shadow-lg">
              ✓
            </span>
          )}
          {isAvailable && (
            <span className="text-base font-bold text-white drop-shadow-lg">
              {level.level}
            </span>
          )}
        </div>
      </div>

      {/* Banner/pennant */}
      <div className="relative -mt-1 flex flex-col items-center">
        <svg className="h-7 w-6" viewBox="0 0 24 28" fill="none">
          <defs>
            <linearGradient
              id={`banner-${level._id}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop
                offset="0%"
                stopColor={isActive ? theme.primary : "#3f3f46"}
              />
              <stop
                offset="100%"
                stopColor={isActive ? theme.secondary : "#27272a"}
              />
            </linearGradient>
          </defs>
          {/* Banner shape with pointed bottom */}
          <path
            d="M2 0 L22 0 L22 22 L12 28 L2 22 Z"
            fill={`url(#banner-${level._id})`}
            stroke={isActive ? theme.accent : "#52525b"}
            strokeWidth="1"
          />
          {/* Highlight stripe */}
          <path
            d="M4 2 L4 20"
            stroke={isActive ? theme.accent : "#52525b"}
            strokeWidth="1"
            opacity="0.4"
          />
        </svg>

        {/* Level number on banner */}
        <span
          className={cn(
            "absolute top-1 text-xs font-bold",
            isActive ? "text-white/90" : "text-zinc-500",
          )}
        >
          {level.level}
        </span>
      </div>
    </div>
  );
}
