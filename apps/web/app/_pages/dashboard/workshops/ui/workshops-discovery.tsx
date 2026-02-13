"use client";

import type { Preloaded } from "convex/react";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import Image from "next/image";
import { useForm } from "@tanstack/react-form";
import { usePaginatedQuery, usePreloadedQuery, useQuery } from "convex/react";
import { CalendarDays, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { api } from "@buildea/convex/_generated/api";
import {
  formatRelativeDateLabel,
  formatTimeByLocale,
} from "@buildea/features/shared/lib";
import { Badge } from "@buildea/ui/components/badge";
import { Button } from "@buildea/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@buildea/ui/components/empty";
import { Input } from "@buildea/ui/components/input";
import { ScrollArea } from "@buildea/ui/components/scroll-area";

import { WorkshopsTimeline } from "./workshops-timeline";

type UpcomingPreloaded = Preloaded<typeof api.workshops.listUpcoming>;
type UpcomingPage = ReturnType<
  typeof usePreloadedQuery<typeof api.workshops.listUpcoming>
>;
type WorkshopItem = UpcomingPage["page"][number];

type GroupedWorkshops = {
  dateKey: string;
  label: { date: string; weekday: string };
  items: WorkshopItem[];
}[];

interface WorkshopsDiscoveryContextValue {
  debouncedQuery: string;
  locale: string;
}

const PAGE_SIZE = 12;
const SEARCH_LIMIT = 30;

const WorkshopsDiscoveryContext =
  createContext<WorkshopsDiscoveryContextValue | null>(null);

function useWorkshopsDiscoveryContext(): WorkshopsDiscoveryContextValue {
  const context = useContext(WorkshopsDiscoveryContext);

  if (!context) {
    throw new Error(
      "Workshops discovery context is missing. Wrap content with WorkshopsDiscoveryShell.",
    );
  }

  return context;
}

export function WorkshopsDiscoveryShell({ children }: { children: ReactNode }) {
  const t = useTranslations("workshops");
  const locale = useLocale();
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const form = useForm({
    defaultValues: {
      query: "",
    },
  });

  return (
    <WorkshopsDiscoveryContext.Provider value={{ debouncedQuery, locale }}>
      <div className="space-y-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
          }}
        >
          <form.Field
            name="query"
            listeners={{
              onChangeDebounceMs: 400,
              onChange: ({ value }) => {
                setDebouncedQuery(value.trim());
              },
            }}
          >
            {(field) => (
              <Input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                placeholder={t("search.placeholder")}
                autoComplete="off"
                aria-label={t("search.aria_label")}
              />
            )}
          </form.Field>
        </form>

        {children}
      </div>
    </WorkshopsDiscoveryContext.Provider>
  );
}

export function WorkshopsDiscovery({
  preloadedUpcoming,
}: {
  preloadedUpcoming: UpcomingPreloaded;
}) {
  const t = useTranslations("workshops");
  const { debouncedQuery, locale } = useWorkshopsDiscoveryContext();
  const initialUpcoming = usePreloadedQuery(preloadedUpcoming);
  const [now] = useState(() => Date.now());

  const upcomingPaginated = usePaginatedQuery(
    api.workshops.listUpcoming,
    {},
    { initialNumItems: PAGE_SIZE },
  );

  const searchResults = useQuery(
    api.workshops.search,
    debouncedQuery.length > 0
      ? {
          query: debouncedQuery,
          limit: SEARCH_LIMIT,
        }
      : "skip",
  );

  const isSearchMode = debouncedQuery.length > 0;
  const workshopList = useMemo(() => {
    if (isSearchMode) {
      return searchResults ?? [];
    }

    if (upcomingPaginated.results.length > 0) {
      return upcomingPaginated.results;
    }

    return initialUpcoming.page;
  }, [
    initialUpcoming.page,
    isSearchMode,
    searchResults,
    upcomingPaginated.results,
  ]);

  const groupedWorkshops = useMemo(
    () =>
      groupWorkshopsByDate(workshopList, now, locale, {
        today: t("relative.today"),
        tomorrow: t("relative.tomorrow"),
      }),
    [workshopList, now, locale, t],
  );

  return (
    <>
      <ScrollArea className="h-[70svh] rounded-xl border p-4">
        {groupedWorkshops.length === 0 ? (
          <Empty className="py-10">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <CalendarDays className="size-5" />
              </EmptyMedia>
              <EmptyTitle>{t("empty.title")}</EmptyTitle>
              <EmptyDescription>{t("empty.description")}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <WorkshopsTimeline.Root>
            {groupedWorkshops.map((group) => (
              <WorkshopsTimeline.Group key={group.dateKey}>
                <WorkshopsTimeline.StickyDate>
                  <span className="font-semibold">
                    {group.label.date}
                  </span>
                  <span className="text-muted-foreground font-normal">
                    {group.label.weekday}
                  </span>
                </WorkshopsTimeline.StickyDate>
                <WorkshopsTimeline.Rail />
                <WorkshopsTimeline.GroupItems>
                  {group.items.map((workshop) => (
                    <WorkshopTimelineCard
                      key={workshop._id}
                      workshop={workshop}
                    />
                  ))}
                </WorkshopsTimeline.GroupItems>
              </WorkshopsTimeline.Group>
            ))}
          </WorkshopsTimeline.Root>
        )}
      </ScrollArea>

      {!isSearchMode && upcomingPaginated.status !== "Exhausted" ? (
        <div className="flex justify-center">
          <Button
            variant="secondary"
            onClick={() => {
              upcomingPaginated.loadMore(PAGE_SIZE);
            }}
            disabled={upcomingPaginated.isLoading}
          >
            {upcomingPaginated.isLoading
              ? t("actions.loading")
              : t("actions.load_more")}
          </Button>
        </div>
      ) : null}
    </>
  );
}

function WorkshopTimelineCard({ workshop }: { workshop: WorkshopItem }) {
  const t = useTranslations("workshops");
  const locale = useLocale();
  const startTime = formatTimeByLocale(workshop.startDate, locale);
  const communityName = workshop.community.name ?? t("fallback.community_name");

  return (
    <WorkshopsTimeline.Item>
      <WorkshopsTimeline.ItemCard>
        <WorkshopsTimeline.ItemLink href={`/workshops/${workshop._id}`}>
          <WorkshopsTimeline.ItemCardContent>
            <div className="grid grid-cols-[1fr_auto] gap-4">
              <div className="space-y-2">
                <WorkshopsTimeline.ItemMeta>
                  {startTime}
                </WorkshopsTimeline.ItemMeta>
                <WorkshopsTimeline.ItemTitle>
                  {workshop.title}
                </WorkshopsTimeline.ItemTitle>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <CalendarDays className="size-4" />
                  <span>{t("card.by_community", { communityName })}</span>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  <MapPin className="size-4" />
                  <span>{t("card.location_fallback")}</span>
                </div>
                {workshop.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {workshop.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>

              <WorkshopsTimeline.ItemSide>
                {workshop.imageUrl ? (
                  <Image
                    src={workshop.imageUrl}
                    alt={workshop.title}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                ) : (
                  <div className="bg-muted size-full" />
                )}
              </WorkshopsTimeline.ItemSide>
            </div>
          </WorkshopsTimeline.ItemCardContent>
        </WorkshopsTimeline.ItemLink>
      </WorkshopsTimeline.ItemCard>
    </WorkshopsTimeline.Item>
  );
}

function groupWorkshopsByDate(
  workshops: WorkshopItem[],
  now: number,
  locale: string,
  relativeLabels: { today: string; tomorrow: string },
): GroupedWorkshops {
  const groups = new Map<
    string,
    { label: { date: string; weekday: string }; items: WorkshopItem[] }
  >();

  for (const workshop of workshops) {
    const keyDate = new Date(workshop.startDate);
    keyDate.setHours(0, 0, 0, 0);
    const dateKey = String(keyDate.getTime());

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        label: formatRelativeDateLabel(
          keyDate.getTime(),
          now,
          locale,
          relativeLabels,
        ),
        items: [],
      });
    }

    groups.get(dateKey)?.items.push(workshop);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([dateKey, value]) => ({
      dateKey,
      label: value.label,
      items: value.items.sort(
        (left, right) => left.startDate - right.startDate,
      ),
    }));
}
