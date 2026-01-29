import Link from "next/link";
import {
  CalendarIcon,
  GlobeIcon,
  PlayIcon,
  TrophyIcon,
  UsersIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@buildea/ui/components/button";
import { cn } from "@buildea/ui/lib/utils";

export function HeroSection({ className }: { className?: string }) {
  const t = useTranslations("landing");
  return (
    <div
      className={cn(
        `flex flex-col items-center justify-center px-6 text-center`,
        className,
      )}
    >
      {/* Badge */}
      <div
        className={`border-primary-contrast/50 bg-primary-contrast/8 mb-8 inline-flex items-center gap-2 rounded-lg border px-5 py-2.5`}
      >
        <GlobeIcon className="text-primary-contrast size-4 animate-pulse" />
        <span className="text-primary-contrast text-xs font-semibold tracking-wider uppercase">
          {t("hero.badge")}
        </span>
      </div>

      {/* Main Title - Removed text-shimmer class */}
      <h1
        className="dark:text-primary font-heading text-foreground mb-6 cursor-default tracking-wide"
        style={{
          fontSize: "clamp(7rem, 20vw, 14rem)",
          lineHeight: 0.85,
        }}
      >
        {t("hero.title")}
      </h1>

      {/* Subtitle */}
      <p className="text-foreground mb-4 max-w-2xl text-lg leading-relaxed md:text-xl">
        {t.rich("hero.description", {
          highlight: (chunks) => (
            <span className="text-primary-contrast font-semibold">
              {chunks}
            </span>
          ),
        })}
      </p>

      <p className="text-muted-foreground mb-12 max-w-[50ch] text-sm md:text-base">
        {t("hero.sub_description")}
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <Button
          size="lg"
          className="group font-pixel border tracking-tighter uppercase"
          asChild
        >
          <Link href="/dashboard">
            <PlayIcon className="size-5 fill-current" />
            <span>{t("hero.cta.primary")}</span>
            {/* <ArrowRightIcon className="size-5 transition-transform group-hover:translate-x-1" /> */}
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="font-pixel tracking-tighter uppercase"
        >
          {t("hero.cta.secondary")}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="mt-24 grid grid-cols-2 gap-x-12 gap-y-8 md:grid-cols-4 md:gap-x-16">
        {[
          { icon: UsersIcon, value: "1000+", label: t("stats.builders") },
          { icon: CalendarIcon, value: "120+", label: t("stats.events") },
          { icon: TrophyIcon, value: "10+", label: t("stats.hackathons") },
          { icon: GlobeIcon, value: "8", label: t("stats.countries") },
        ].map((stat, i) => (
          <div
            key={i}
            className="group flex cursor-default flex-col items-start"
            style={{ animationDelay: `${0.8 + i * 0.1}s` }}
          >
            <div className="mb-2 flex items-center gap-2">
              <stat.icon className="text-primary-contrast h-4 w-4 transition-transform group-hover:scale-125" />
              <span className="text-primary-contrast text-xs font-semibold tracking-wider uppercase">
                {stat.label}
              </span>
            </div>
            <span className="text-foreground group-hover:text-primary font-pixel text-2xl font-bold transition-all group-hover:scale-105 md:text-3xl">
              {/* <AnimatedCounter value={stat.value} duration={2000 + i * 200} /> */}
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
