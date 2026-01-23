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

import { preloadAuthQuery } from "@/auth/server";
import { UserAvatarProfileSkeleton } from "@/widgets/auth/user-avatar-profile-skeleton";

import SidebarMenuItems from "./sidebar-menu-items";
import { UserMenu } from "./user-menu";

export default function AppSidebar() {
  const currentUserPromise = preloadAuthQuery(api.auth.getCurrentUserClient);

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
        <Suspense fallback={<UserAvatarProfileSkeleton />}>
          <UserMenu currentUserPromise={currentUserPromise} />
        </Suspense>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
