"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@buildea/ui/components/select";

import { locales } from "../i18n/locales";

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("languages");

  const handleLocaleChange = (newLocale: string) => {
    // Replace locale segment in pathname
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.replace(segments.join("/"));
  };

  const getLanguageName = (localeCode: string) => {
    try {
      return t(localeCode);
    } catch {
      return localeCode.toUpperCase();
    }
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="h-9 w-fit">
        <SelectValue>{getLanguageName(locale)}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {getLanguageName(loc)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
