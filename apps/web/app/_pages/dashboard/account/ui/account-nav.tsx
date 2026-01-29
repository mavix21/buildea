"use client";

import { IconSettings, IconUser } from "@tabler/icons-react";

import { Tabs, TabsList, TabsTrigger } from "@buildea/ui/components/tabs";

import { Link, usePathname } from "@/shared/i18n";

const accountNavItems = [
  { title: "Profile", href: "/account/profile", icon: IconUser },
  {
    title: "Settings",
    href: "/account/settings",
    icon: IconSettings,
  },
];

export function AccountNav() {
  const pathname = usePathname();
  const currentTab =
    accountNavItems.find((item) => pathname === item.href)?.href ??
    "/account/profile";

  return (
    <Tabs
      value={currentTab}
      orientation="vertical"
      className="border-secondary w-full self-start rounded-lg border p-1 md:w-48"
    >
      <TabsList className="flex h-auto w-full flex-col bg-transparent">
        {accountNavItems.map((item) => (
          <TabsTrigger
            key={item.href}
            value={item.href}
            asChild
            className="justify-start gap-2 px-3 py-2"
          >
            <Link href={item.href}>
              <item.icon className="size-4" />
              {item.title}
            </Link>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
