"use server";

import { api } from "@buildea/convex/_generated/api";

import { fetchAuthQuery } from "@/auth/server";

import type { Organization, OrganizationMember } from "./organization.types";

/**
 * Server-side function to get all organizations (admin only)
 * Uses fetchAuthQuery to call Convex with auth context
 */
export async function getOrganizations(): Promise<Organization[]> {
  const organizations = await fetchAuthQuery(api.admin.listOrganizations, {});

  return organizations.map((org) => ({
    ...org,
    logo: org.logo ?? null,
    metadata: (org.metadata as Record<string, unknown> | null) ?? null,
    createdAt: new Date(org.createdAt),
  }));
}

/**
 * Server-side function to get organization members
 */
export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMember[]> {
  const organization = await fetchAuthQuery(api.admin.getFullOrganization, {
    organizationId,
  });

  if (!organization?.members) {
    return [];
  }

  return organization.members.map((member) => ({
    ...member,
    createdAt: new Date(member.createdAt),
  }));
}

/**
 * Server-side function to check if current user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    return await fetchAuthQuery(api.admin.isAdmin, {});
  } catch {
    return false;
  }
}
