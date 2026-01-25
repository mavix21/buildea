"use client";

import type { Preloaded } from "convex/react";
import * as React from "react";
import { usePreloadedQuery, useQuery } from "convex/react";

import { api } from "@buildea/convex/_generated/api";

import type {
  Organization,
  OrganizationMember,
} from "../model/organization.types";
import { useOrganizationMutations } from "../model/use-organization-mutations";
import { getColumns } from "./columns";
import { EditOrgDialog } from "./edit-org-dialog";
import { OrgMembersDialog } from "./org-members-dialog";
import { OrganizationsTable } from "./organizations-table";

interface OrganizationsPageClientProps {
  preloadedOrganizations: Preloaded<typeof api.admin.listOrganizations>;
}

export function OrganizationsPageClient({
  preloadedOrganizations,
}: OrganizationsPageClientProps) {
  const rawOrganizations = usePreloadedQuery(preloadedOrganizations);
  const { deleteOrganization } = useOrganizationMutations();

  // Transform to UI type with Date objects
  const organizations: Organization[] = React.useMemo(
    () =>
      rawOrganizations.map((org) => ({
        ...org,
        logo: org.logo ?? null,
        metadata: (org.metadata as Record<string, unknown> | null) ?? null,
        createdAt: new Date(org.createdAt),
      })),
    [rawOrganizations],
  );

  // Dialog states
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [membersDialogOpen, setMembersDialogOpen] = React.useState(false);

  // Selected organization for edit/members
  const [selectedOrg, setSelectedOrg] = React.useState<Organization | null>(
    null,
  );

  // Fetch members for the selected organization using reactive Convex query
  const membersResult = useQuery(
    api.admin.listOrganizationMembers,
    selectedOrg ? { organizationId: selectedOrg.id } : "skip",
  );

  // Transform members to UI type
  const selectedOrgMembers: OrganizationMember[] = React.useMemo(() => {
    if (!membersResult?.members) return [];

    return membersResult.members.map((member) => ({
      ...member,
      createdAt: new Date(member.createdAt),
    }));
  }, [membersResult]);

  // Loading states
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Handlers
  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setEditDialogOpen(true);
  };

  const handleDelete = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"?`)) return;
    setIsDeleting(true);
    try {
      await deleteOrganization(org.id);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleManageMembers = (org: Organization) => {
    setSelectedOrg(org);
    setMembersDialogOpen(true);
  };

  // Build columns with action handlers
  const tableColumns = getColumns({
    onEdit: handleEdit,
    onDelete: (org) => void handleDelete(org),
    onManageMembers: handleManageMembers,
    isDeleting,
  });

  return (
    <div className="space-y-4">
      <OrganizationsTable columns={tableColumns} data={organizations} />

      {/* Controlled Dialogs */}
      <EditOrgDialog
        organization={selectedOrg}
        open={editDialogOpen}
        onOpenChange={(open) => {
          setEditDialogOpen(open);
          if (!open) setSelectedOrg(null);
        }}
      />

      <OrgMembersDialog
        organization={selectedOrg}
        members={selectedOrgMembers}
        open={membersDialogOpen}
        onOpenChange={(open) => {
          setMembersDialogOpen(open);
          if (!open) {
            setSelectedOrg(null);
          }
        }}
      />
    </div>
  );
}
