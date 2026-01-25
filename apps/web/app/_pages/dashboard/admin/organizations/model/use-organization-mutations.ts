"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { authClient } from "@/auth/client";

/**
 * Hook for organization mutations (create, update, delete)
 * Uses better-auth client for optimistic updates
 */
export function useOrganizationMutations() {
  const createOrganization = useCallback(
    async (data: { name: string; slug: string }) => {
      const result = await authClient.organization.create({
        name: data.name,
        slug: data.slug,
        keepCurrentActiveOrganization: false,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to create organization");
        return null;
      }

      toast.success("Organization created successfully");
      return result.data;
    },
    [],
  );

  const deleteOrganization = useCallback(async (organizationId: string) => {
    const result = await authClient.organization.delete({
      organizationId,
    });

    if (result.error) {
      toast.error(result.error.message ?? "Failed to delete organization");
      return false;
    }

    toast.success("Organization deleted successfully");
    return true;
  }, []);

  const updateOrganization = useCallback(
    async (
      organizationId: string,
      data: { name?: string; slug?: string; logo?: string },
    ) => {
      const result = await authClient.organization.update({
        organizationId,
        data,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to update organization");
        return null;
      }

      toast.success("Organization updated successfully");
      return result.data;
    },
    [],
  );

  return {
    createOrganization,
    deleteOrganization,
    updateOrganization,
  };
}

/**
 * Hook for organization member mutations
 */
export function useOrganizationMemberMutations() {
  const addMember = useCallback(
    async (data: {
      organizationId: string;
      email: string;
      role: "admin" | "member";
    }) => {
      // Use invitation flow since addMember is server-only
      const result = await authClient.organization.inviteMember({
        organizationId: data.organizationId,
        email: data.email,
        role: data.role,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to invite member");
        return null;
      }

      toast.success("Invitation sent successfully");
      return result.data;
    },
    [],
  );

  const removeMember = useCallback(
    async (organizationId: string, memberIdOrEmail: string) => {
      const result = await authClient.organization.removeMember({
        organizationId,
        memberIdOrEmail,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to remove member");
        return false;
      }

      toast.success("Member removed successfully");
      return true;
    },
    [],
  );

  const updateMemberRole = useCallback(
    async (data: {
      organizationId: string;
      memberId: string;
      role: "admin" | "member" | "owner";
    }) => {
      const result = await authClient.organization.updateMemberRole({
        organizationId: data.organizationId,
        memberId: data.memberId,
        role: data.role,
      });

      if (result.error) {
        toast.error(result.error.message ?? "Failed to update member role");
        return null;
      }

      toast.success("Member role updated successfully");
      return result.data;
    },
    [],
  );

  return {
    addMember,
    removeMember,
    updateMemberRole,
  };
}
