import { setRequestLocale } from "next-intl/server";

import { LandingPage } from "@/pages/marketing/landing-page";
import { routing } from "@/shared/i18n/routing";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Enable static rendering
  setRequestLocale(locale);

  return <LandingPage />;
}
