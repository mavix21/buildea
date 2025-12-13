import type * as React from "react";

import { cn } from "@buildea/ui/lib/utils";

export function FloatingPixelIcon({
  icon: Icon,
  className,
  delay = 0,
  size = 24,
}: {
  icon: React.ElementType;
  className?: string;
  delay?: number;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "text-primary-contrast glow-primary absolute opacity-50 dark:opacity-20",
        className,
      )}
      style={{
        animationDelay: `${delay}s`,
      }}
    >
      <Icon size={size} strokeWidth={1.5} />
    </div>
  );
}
