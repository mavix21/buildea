"use client";

import { Suspense } from "react";
import { IconChevronRight } from "@tabler/icons-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@buildea/ui/components/collapsible";
import {
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@buildea/ui/components/sidebar";

import { Link, usePathname } from "@/shared/i18n";
import { Icons } from "@/shared/ui/icons";

interface SubItem {
  title: string;
  url: string;
}

interface CollapsibleNavItemProps {
  title: string;
  url: string;
  icon?: keyof typeof Icons;
  isActive?: boolean;
  items: SubItem[];
}

// Inner component that uses usePathname
function CollapsibleNavItemInner({
  title,
  url,
  icon,
  isActive,
  items,
}: CollapsibleNavItemProps) {
  const pathname = usePathname();
  const Icon = icon ? Icons[icon] : Icons.logo;

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={title} isActive={pathname === url}>
            <Icon />
            <span>{title}</span>
            <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem) => (
              <NavSubItem
                key={subItem.title}
                title={subItem.title}
                url={subItem.url}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

// Fallback without active state
function CollapsibleNavItemFallback({
  title,
  icon,
  isActive,
  items,
}: Omit<CollapsibleNavItemProps, "url">) {
  const Icon = icon ? Icons[icon] : Icons.logo;

  return (
    <Collapsible asChild defaultOpen={isActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={title}>
            <Icon />
            <span>{title}</span>
            <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {items.map((subItem) => (
              <NavSubItem
                key={subItem.title}
                title={subItem.title}
                url={subItem.url}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function CollapsibleNavItem(props: CollapsibleNavItemProps) {
  return (
    <Suspense fallback={<CollapsibleNavItemFallback {...props} />}>
      <CollapsibleNavItemInner {...props} />
    </Suspense>
  );
}

// Sub-item with its own Suspense boundary
interface NavSubItemProps {
  title: string;
  url: string;
}

function NavSubItemInner({ title, url }: NavSubItemProps) {
  const pathname = usePathname();

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={pathname === url}>
        <Link href={url}>
          <span>{title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function NavSubItemFallback({ title }: Pick<NavSubItemProps, "title">) {
  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton>
        <span>{title}</span>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

export function NavSubItem(props: NavSubItemProps) {
  return (
    <Suspense fallback={<NavSubItemFallback {...props} />}>
      <NavSubItemInner {...props} />
    </Suspense>
  );
}
