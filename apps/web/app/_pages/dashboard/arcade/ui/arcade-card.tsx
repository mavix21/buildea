import Image from "next/image";
import Link from "next/link";
import { BarChart3 } from "lucide-react";

import { Badge } from "@buildea/ui/components/badge";
import { cn } from "@buildea/ui/lib/utils";

import type { Arcade, ArcadeDifficulty } from "../model/types";

const difficultyConfig: Record<
  ArcadeDifficulty,
  { label: string; className: string }
> = {
  beginner: {
    label: "Beginner",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  intermediate: {
    label: "Intermediate",
    className: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
  advanced: {
    label: "Advanced",
    className: "bg-rose-500/20 text-rose-400 border-rose-500/30",
  },
};

interface ArcadeCardProps {
  arcade: Arcade;
  variant?: "default" | "featured";
  className?: string;
}

export function ArcadeCard({
  arcade,
  variant = "default",
  className,
}: ArcadeCardProps) {
  const { label, className: difficultyClassName } =
    difficultyConfig[arcade.difficulty];

  return (
    <Link
      href={`/dashboard/arcade/${arcade.id}` as `/${string}`}
      className={cn(
        "group border-border/50 bg-card hover:border-border focus-visible:ring-ring relative flex flex-col overflow-hidden rounded-lg border transition-all hover:shadow-lg focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-video w-full overflow-hidden">
        <Image
          src={arcade.imageUrl}
          alt={arcade.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          style={{ imageRendering: "pixelated" }}
        />

        {/* New Badge */}
        {arcade.isNew && (
          <span className="bg-primary text-primary-foreground absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-semibold shadow-md">
            New!
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        {variant === "featured" && (
          <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
            Arcade {arcade.id.split("-")[0]}
          </span>
        )}

        <h3 className="font-pixel text-foreground group-hover:text-primary text-base leading-tight font-semibold">
          {arcade.title}
        </h3>

        <p className="text-muted-foreground line-clamp-2 text-sm">
          {arcade.description}
        </p>

        {/* Difficulty Badge */}
        <div className="mt-auto pt-3">
          <Badge
            variant="outline"
            className={cn(
              "inline-flex items-center gap-1.5 text-xs",
              difficultyClassName,
            )}
          >
            <BarChart3 className="size-3" aria-hidden="true" />
            {label}
          </Badge>
        </div>
      </div>
    </Link>
  );
}
