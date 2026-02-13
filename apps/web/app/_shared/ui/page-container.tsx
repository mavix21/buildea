import type React from "react";

import { ScrollArea } from "@buildea/ui/components/scroll-area";
import { cn } from "@buildea/ui/lib/utils";

import { Heading } from "./heading";

function PageSkeleton() {
  return (
    <div className="flex flex-1 animate-pulse flex-col gap-4 p-4 md:px-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="bg-muted mb-2 h-8 w-48 rounded" />
          <div className="bg-muted h-4 w-96 rounded" />
        </div>
      </div>
      <div className="bg-muted mt-6 h-40 w-full rounded-lg" />
      <div className="bg-muted h-40 w-full rounded-lg" />
    </div>
  );
}

export default function PageContainer({
  children,
  className,
  scrollable = true,
  isloading = false,
  access = true,
  accessFallback,
  pageTitle,
  pageDescription,
  pageHeaderAction,
}: {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
  isloading?: boolean;
  access?: boolean;
  accessFallback?: React.ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  pageHeaderAction?: React.ReactNode;
}) {
  if (!access) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 md:px-6">
        {accessFallback ?? (
          <div className="text-muted-foreground text-center text-lg">
            You do not have access to this page.
          </div>
        )}
      </div>
    );
  }

  const content = isloading ? <PageSkeleton /> : children;

  const innerContent = (
    <div
      className={cn(
        "mx-auto flex w-full flex-1 flex-col p-4 md:px-6 lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl",
        className,
      )}
    >
      {pageTitle && (
        <div className="mb-6 flex items-start justify-between">
          <Heading title={pageTitle} description={pageDescription ?? ""} />
          {pageHeaderAction && <div>{pageHeaderAction}</div>}
        </div>
      )}
      {content}
    </div>
  );

  return scrollable ? (
    <ScrollArea className="h-[calc(100svh-3.5rem-1rem)]">
      {/* header height: 3.5rem, inset margin: 1rem  */}
      {innerContent}
    </ScrollArea>
  ) : (
    innerContent
  );
}
