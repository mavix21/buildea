import { useTranslations } from "next-intl";

import { Link } from "@/shared/i18n";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";
import { ThemeSwitcher } from "@/shared/ui/theme-switcher";

const menuItems = [
  { name: "events", href: "#events" },
  { name: "community", href: "#community" },
  { name: "hackathons", href: "#hackathons" },
] as const;

export function NavItems() {
  const t = useTranslations("landing");
  return (
    <>
      <div className="absolute inset-0 m-auto hidden size-fit lg:block">
        <ul className="flex gap-8 text-sm">
          {menuItems.map((item, index) => (
            <li key={index}>
              <Link
                href={item.href}
                className="text-muted-foreground hover:text-accent-foreground block duration-150"
              >
                <span>{t(`navigation.${item.name}`)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-background mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl p-6 shadow-2xl shadow-zinc-300/20 in-data-[state=active]:block md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none lg:in-data-[state=active]:flex dark:shadow-none dark:lg:bg-transparent">
        <div className="lg:hidden">
          <ul className="space-y-6 text-base">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-accent-foreground block duration-150"
                >
                  <span>{t(`navigation.${item.name}`)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </>
  );
}
