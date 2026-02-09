"use client";

import { createContext, use } from "react";
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
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@buildea/ui/components/avatar";
import { Button } from "@buildea/ui/components/button";
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

// Context for sharing user data across compound components
interface UserMenuContextValue {
  user: {
    id: string;
    name: string;
    email: string;
    username: string | null;
    image: string | null;
  };
  locale: string;
}

const UserMenuContext = createContext<UserMenuContextValue | null>(null);

function useUserMenuContext() {
  const context = use(UserMenuContext);
  if (!context) {
    throw new Error(
      "UserMenu components must be used within UserMenu.Provider",
    );
  }
  return context;
}

// Provider component that handles data fetching
interface UserMenuProviderProps {
  currentUserPromise: ReturnType<
    typeof preloadAuthQuery<typeof api.auth.getCurrentUserClient>
  >;
  children: React.ReactNode;
}

function UserMenuProvider({
  currentUserPromise,
  children,
}: UserMenuProviderProps) {
  const preloadedUser = use(currentUserPromise);
  const user = usePreloadedQuery(preloadedUser);
  const locale = useLocale();

  return <UserMenuContext value={{ user, locale }}>{children}</UserMenuContext>;
}

// Root component that wraps everything
function UserMenuRoot({ children }: { children: React.ReactNode }) {
  return <DropdownMenu>{children}</DropdownMenu>;
}

// Trigger wrapper - consumers compose their own trigger content
function UserMenuTrigger({ children }: { children: React.ReactNode }) {
  return <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>;
}

// Sidebar-specific trigger (full layout with SidebarMenuButton)
function UserMenuSidebarTrigger() {
  const { user } = useUserMenuContext();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <UserMenuTrigger>
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
        </UserMenuTrigger>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

// Avatar-only trigger (for header/compact contexts)
function UserMenuAvatarTrigger({ className }: { className?: string }) {
  const { user } = useUserMenuContext();

  return (
    <UserMenuTrigger>
      <Button className="rounded-full" variant="ghost" size="icon">
        <Avatar className={className ?? "h-8 w-8"}>
          <AvatarImage src={user.image ?? ""} alt={user.name} />
          <AvatarFallback className="rounded-full">
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>
    </UserMenuTrigger>
  );
}

// Menu content with all dropdown items
interface UserMenuContentProps {
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  sideOffset?: number;
}

function UserMenuContent({
  align = "end",
  side = "bottom",
  sideOffset = 4,
}: UserMenuContentProps) {
  const { user, locale } = useUserMenuContext();

  return (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      side={side}
      align={align}
      sideOffset={sideOffset}
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
            href={`/${locale}/b/${user.username ?? user.id}`}
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
  );
}

// Export as compound component
export const UserMenu = {
  Provider: UserMenuProvider,
  Root: UserMenuRoot,
  Trigger: UserMenuTrigger,
  SidebarTrigger: UserMenuSidebarTrigger,
  AvatarTrigger: UserMenuAvatarTrigger,
  Content: UserMenuContent,
};

// Pre-composed variant for sidebar (backward compatible)
interface SidebarUserMenuProps {
  currentUserPromise: ReturnType<
    typeof preloadAuthQuery<typeof api.auth.getCurrentUserClient>
  >;
}

export function SidebarUserMenu({ currentUserPromise }: SidebarUserMenuProps) {
  return (
    <UserMenu.Provider currentUserPromise={currentUserPromise}>
      <UserMenu.Root>
        <UserMenu.SidebarTrigger />
        <UserMenu.Content />
      </UserMenu.Root>
    </UserMenu.Provider>
  );
}

// Pre-composed variant for header (avatar-only trigger)
interface HeaderUserMenuProps {
  currentUserPromise: ReturnType<
    typeof preloadAuthQuery<typeof api.auth.getCurrentUserClient>
  >;
}

export function HeaderUserMenu({ currentUserPromise }: HeaderUserMenuProps) {
  return (
    <UserMenu.Provider currentUserPromise={currentUserPromise}>
      <UserMenu.Root>
        <UserMenu.AvatarTrigger />
        <UserMenu.Content align="end" />
      </UserMenu.Root>
    </UserMenu.Provider>
  );
}
