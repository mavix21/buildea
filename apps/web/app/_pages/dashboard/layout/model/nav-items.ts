import type { NavItem } from "./nav-items.type";

/**
 * Navigation configuration with RBAC support
 *
 * This configuration is used for both the sidebar navigation and Cmd+K bar.
 *
 * RBAC Access Control:
 * Each navigation item can have an `access` property that controls visibility
 * based on permissions, plans, features, roles, and organization context.
 *
 * Examples:
 *
 * 1. Require organization:
 *    access: { requireOrg: true }
 *
 * 2. Require specific permission:
 *    access: { requireOrg: true, permission: 'org:teams:manage' }
 *
 * 3. Require specific plan:
 *    access: { plan: 'pro' }
 *
 * 4. Require specific feature:
 *    access: { feature: 'premium_access' }
 *
 * 5. Require specific role:
 *    access: { role: 'admin' }
 *
 * 6. Multiple conditions (all must be true):
 *    access: { requireOrg: true, permission: 'org:teams:manage', plan: 'pro' }
 *
 * Note: The `visible` function is deprecated but still supported for backward compatibility.
 * Use the `access` property for new items.
 */
export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: "dashboard",
    isActive: false,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Arcade",
    url: "/dashboard/arcade",
    icon: "arcade",
    isActive: false,
    items: [],
  },
  {
    title: "Workshops",
    url: "/dashboard/workshops",
    icon: "pick",
    isActive: false,
    items: [],
    // Alternative: require specific permission
    // access: { requireOrg: true, permission: 'org:teams:view' }
  },
  {
    title: "Admin",
    url: "#", // Placeholder as there is no direct link for the parent
    icon: "admin",
    isActive: true,
    access: { role: "admin" },
    items: [
      {
        title: "Organizations",
        url: "/dashboard/admin/organizations",
        icon: "teams",
        shortcut: ["a", "o"],
      },
    ],
  },
  {
    title: "Account",
    url: "#", // Placeholder as there is no direct link for the parent
    icon: "account",
    isActive: true,
    items: [
      {
        title: "Profile",
        url: "/dashboard/profile",
        icon: "profile",
        shortcut: ["m", "m"],
      },
      {
        title: "Billing",
        url: "/dashboard/billing",
        icon: "billing",
        shortcut: ["b", "b"],
        // Only show billing if in organization context
        access: { requireOrg: true },
        // Alternative: require billing management permission
        // access: { requireOrg: true, permission: 'org:manage:billing' }
      },
    ],
  },
];
