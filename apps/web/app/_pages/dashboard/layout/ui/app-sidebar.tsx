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
import { Link } from "@/shared/i18n";
import { UserAvatarProfileSkeleton } from "@/widgets/auth/user-avatar-profile-skeleton";

import SidebarMenuItems from "./sidebar-menu-items";
import { UserMenu } from "./user-menu";

export default function AppSidebar() {
  const currentUserPromise = preloadAuthQuery(api.auth.getCurrentUserClient);

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="@container">
        <Suspense>
          <Link
            href="/dashboard"
            className="dark:text-primary font-heading text-foreground cursor-pointer text-sm tracking-wide @min-[215px]:pl-2 @min-[215px]:text-4xl"
          >
            Buildea
          </Link>
        </Suspense>
      </SidebarHeader>
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
