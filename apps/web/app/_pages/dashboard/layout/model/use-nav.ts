"use client";

import * as React from "react";
import { useQuery } from "convex/react";

import { api } from "@buildea/convex/_generated/api";

import { authClient } from "@/auth/client";

import type { NavItem } from "./nav-items.type";

interface AccessContext {
  userRole: string | null | undefined;
  hasOrg: boolean;
}

/**
 * Check if a navigation item is accessible based on access rules
 */
function canAccess(item: NavItem, ctx: AccessContext): boolean {
  if (!item.access) return true;
  if (item.access.requireOrg && !ctx.hasOrg) return false;
  if (item.access.role && ctx.userRole !== item.access.role) return false;
  return true;
}

/**
 * Recursively filter navigation items based on access rules
 */
function filterNavItems(items: NavItem[], ctx: AccessContext): NavItem[] {
  return items
    .filter((item) => canAccess(item, ctx))
    .map((item) => ({
      ...item,
      items: item.items ? filterNavItems(item.items, ctx) : undefined,
    }));
}

/**
 * Hook to filter navigation items based on RBAC (fully client-side)
 *
 * @param items - Array of navigation items to filter
 * @returns Filtered items
 */
export function useFilteredNavItems(items: NavItem[]) {
  const user = useQuery(api.auth.getCurrentUserClient);
  const { data: organizations } = authClient.useListOrganizations();

  return React.useMemo(() => {
    const ctx: AccessContext = {
      userRole: user?.role,
      hasOrg: (organizations?.length ?? 0) > 0,
    };

    return filterNavItems(items, ctx);
  }, [items, user?.role, organizations?.length]);
}
