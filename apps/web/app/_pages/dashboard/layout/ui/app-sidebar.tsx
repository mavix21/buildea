import { Suspense } from "react";

import { api } from "@buildea/convex/_generated/api";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarRail,
} from "@buildea/ui/components/sidebar";
import { Skeleton } from "@buildea/ui/components/skeleton";

import { preloadAuthQuery } from "@/auth/server";

import SidebarMenuItems from "./sidebar-menu-items";
import { UserMenu } from "./user-menu";

export default function AppSidebar() {
  const currentUserPromise = preloadAuthQuery(api.auth.getCurrentUser);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>{/* <OrgSwitcher /> */}</SidebarHeader>
      <SidebarContent className="overflow-x-hidden">
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItems />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Suspense fallback={<Skeleton className="h-12 w-full rounded-md" />}>
          <UserMenu currentUserPromise={currentUserPromise} />
        </Suspense>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
