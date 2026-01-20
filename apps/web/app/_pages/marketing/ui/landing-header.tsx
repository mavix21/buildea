"use client";

import React from "react";
import { useTranslations } from "next-intl";

import { Menu, X } from "@buildea/ui";
import { cn } from "@buildea/ui/lib/utils";

import { Link } from "@/shared/i18n";

export function LandingHeader({ children }: { children?: React.ReactNode }) {
  const tCommon = useTranslations("common");

  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                {/* <Logo /> */}
                <div className="col-span-1 col-start-1 row-start-1 hidden items-center justify-center gap-2 lg:flex">
                  <span className="font-semibold">{tCommon("logo")}</span>
                </div>
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={
                  menuState == true
                    ? tCommon("close_menu")
                    : tCommon("open_menu")
                }
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="m-auto size-6 duration-200 in-data-[state=active]:scale-0 in-data-[state=active]:rotate-180 in-data-[state=active]:opacity-0" />
                <X className="absolute inset-0 m-auto size-6 scale-0 -rotate-180 opacity-0 duration-200 in-data-[state=active]:scale-100 in-data-[state=active]:rotate-0 in-data-[state=active]:opacity-100" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </nav>
    </header>
  );
}
