"use client";

import type * as React from "react";
import { useEffect, useRef, useState } from "react";

import { Card, CardContent } from "@buildea/ui/components/card";
import { cn } from "@buildea/ui/lib/utils";

type DivProps = React.ComponentProps<"div">;

type LinkProps = React.ComponentProps<"a">;

function Root({ className, ...props }: DivProps) {
  return <div className={cn("flex flex-col gap-6", className)} {...props} />;
}

function Group({ className, ...props }: DivProps) {
  return <section className={cn("relative", className)} {...props} />;
}

function StickyDate({ className, children, ...props }: DivProps) {
  const [isStuck, setIsStuck] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsStuck(!entry.isIntersecting);
        }
      },
      { threshold: 0, rootMargin: "-1px 0px 0px 0px" },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <div
        ref={sentinelRef}
        className="pointer-events-none h-0 w-0"
        aria-hidden="true"
      />
      <div
        className={cn(
          "sticky top-0 z-10 flex w-fit items-center gap-2 transition-all duration-200",
          isStuck
            ? "border-border/50 bg-background/80 rounded-full border px-4 py-2 backdrop-blur-md"
            : "bg-transparent py-2",
          className,
        )}
        {...props}
      >
        <div className="bg-primary size-2 rounded-full" />
        <span className="flex items-center gap-2 text-sm">{children}</span>
      </div>
    </>
  );
}

/**
 * @deprecated Rail is no longer rendered — the timeline line is now a
 * `border-l` on `GroupItems`. Kept for backwards-compatible usage.
 */
function Rail() {
  return null;
}

function GroupItems({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "border-border ml-1 space-y-4 border-l pb-2 pl-5",
        className,
      )}
      {...props}
    />
  );
}

function Item({ className, ...props }: DivProps) {
  return <article className={cn("relative", className)} {...props} />;
}

function ItemLink({ className, ...props }: LinkProps) {
  return (
    <a
      className={cn(
        "focus-visible:ring-ring block rounded-xl transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none",
        className,
      )}
      {...props}
    />
  );
}

function ItemCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return <Card className={cn("bg-card py-0", className)} {...props} />;
}

function ItemCardContent({
  className,
  ...props
}: React.ComponentProps<typeof CardContent>) {
  return <CardContent className={cn("p-4", className)} {...props} />;
}

function ItemMeta({ className, ...props }: DivProps) {
  return (
    <div
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  );
}

function ItemTitle({ className, ...props }: DivProps) {
  return (
    <h3
      className={cn("text-foreground text-lg font-semibold", className)}
      {...props}
    />
  );
}

function ItemDescription({ className, ...props }: DivProps) {
  return (
    <p className={cn("text-muted-foreground text-sm", className)} {...props} />
  );
}

function ItemSide({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "relative aspect-square w-24 overflow-hidden rounded-xl",
        className,
      )}
      {...props}
    />
  );
}

export const WorkshopsTimeline = {
  Root,
  Group,
  StickyDate,
  Rail,
  GroupItems,
  Item,
  ItemLink,
  ItemCard,
  ItemCardContent,
  ItemMeta,
  ItemTitle,
  ItemDescription,
  ItemSide,
};
