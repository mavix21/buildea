"use client";

import { Suspense } from "react";

import { SidebarMenuButton } from "@buildea/ui/components/sidebar";

import { Link, usePathname } from "@/shared/i18n";
import { Icons } from "@/shared/ui/icons";

interface NavMenuItemLinkProps {
  url: string;
  title: string;
  icon?: keyof typeof Icons;
}

function NavMenuItemLinkInner({ url, title, icon }: NavMenuItemLinkProps) {
  const pathname = usePathname();
  const Icon = icon ? Icons[icon] : Icons.logo;

  return (
    <SidebarMenuButton asChild tooltip={title} isActive={pathname === url}>
      <Link href={url}>
        <Icon />
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  );
}

function NavMenuItemLinkFallback({
  title,
  icon,
}: Pick<NavMenuItemLinkProps, "title" | "icon">) {
  const Icon = icon ? Icons[icon] : Icons.logo;
  return (
    <SidebarMenuButton tooltip={title}>
      <Icon />
      <span>{title}</span>
    </SidebarMenuButton>
  );
}

export function NavMenuItemLink(props: NavMenuItemLinkProps) {
  return (
    <Suspense fallback={<NavMenuItemLinkFallback {...props} />}>
      <NavMenuItemLinkInner {...props} />
    </Suspense>
  );
}
