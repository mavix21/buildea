"use client";

import { use } from "react";
import Link from "next/link";
import {
  IconBell,
  IconChevronsDown,
  IconUserCircle,
} from "@tabler/icons-react";
import { usePreloadedQuery } from "convex/react";
import { useLocale } from "next-intl";

import type { api } from "@buildea/convex/_generated/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@buildea/ui/components/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@buildea/ui/components/sidebar";

import type { preloadAuthQuery } from "@/auth/server";
import { UserAvatarProfile } from "@/widgets/auth";

import SignOutMenuItem from "./sign-out-menu-item";

interface UserMenuProps {
  currentUserPromise: ReturnType<
    typeof preloadAuthQuery<typeof api.auth.getCurrentUserClient>
  >;
}

// Inner component that uses useRouter
export function UserMenu({ currentUserPromise }: UserMenuProps) {
  const preloadedUser = use(currentUserPromise);
  const user = usePreloadedQuery(preloadedUser);
  const locale = useLocale();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatarProfile
                className="h-8 w-8 rounded-lg"
                showInfo
                user={user}
              />
              <IconChevronsDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="px-1 py-1.5">
                <UserAvatarProfile
                  className="h-8 w-8 rounded-lg"
                  showInfo
                  user={user}
                />
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link
                  href={`/${locale}/dashboard/b/${user.username ?? user.id}`}
                  className="flex w-full cursor-pointer items-center"
                >
                  <IconUserCircle className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconBell className="h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <SignOutMenuItem />
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
