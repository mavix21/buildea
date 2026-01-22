"use client";

import { SidebarMenuItem } from "@buildea/ui/components/sidebar";

import { navItems } from "../model/nav-items";
import { useFilteredNavItems } from "../model/use-nav";
import { CollapsibleNavItem } from "./collapsible-nav-item";
import { NavMenuItemLink } from "./nav-menu-item";

export default function SidebarMenuItems() {
  const filteredNavItems = useFilteredNavItems(navItems);
  return (
    <>
      {filteredNavItems.map((item) => {
        return item.items && item.items.length > 0 ? (
          <CollapsibleNavItem
            key={item.title}
            title={item.title}
            url={item.url}
            icon={item.icon}
            isActive={item.isActive}
            items={item.items}
          />
        ) : (
          <SidebarMenuItem key={item.title}>
            <NavMenuItemLink
              url={item.url}
              title={item.title}
              icon={item.icon}
            />
          </SidebarMenuItem>
        );
      })}
    </>
  );
}
