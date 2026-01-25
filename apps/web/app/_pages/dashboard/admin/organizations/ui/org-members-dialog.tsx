"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";
import { Trash2, UserPlus } from "lucide-react";
import * as z from "zod";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@buildea/ui/components/avatar";
import { Badge } from "@buildea/ui/components/badge";
import { Button } from "@buildea/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@buildea/ui/components/dialog";
import { Field, FieldError, FieldLabel } from "@buildea/ui/components/field";
import { Input } from "@buildea/ui/components/input";
import { LoadingButton } from "@buildea/ui/components/loading-button";
import { ScrollArea } from "@buildea/ui/components/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@buildea/ui/components/select";
import { Separator } from "@buildea/ui/components/separator";

import type {
  Organization,
  OrganizationMember,
} from "../model/organization.types";
import { useOrganizationMemberMutations } from "../model/use-organization-mutations";

const inviteMemberSchema = z.object({
  email: z.email("Please enter a valid email address."),
  role: z.enum(["admin", "member"]),
});

interface OrgMembersDialogProps {
  organization: Organization | null;
  members: OrganizationMember[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrgMembersDialog({
  organization,
  members,
  open,
  onOpenChange,
}: OrgMembersDialogProps) {
  const { addMember, removeMember, updateMemberRole } =
    useOrganizationMemberMutations();
  const [loadingMemberId, setLoadingMemberId] = React.useState<string | null>(
    null,
  );

  const form = useForm({
    defaultValues: {
      email: "",
      role: "member" as "admin" | "member",
    },
    validators: {
      onChange: inviteMemberSchema,
    },
    onSubmit: async ({ value }) => {
      if (!organization) return;
      const result = await addMember({
        organizationId: organization.id,
        email: value.email,
        role: value.role,
      });
      if (result) {
        form.reset();
      }
    },
  });

  const handleRemoveMember = async (member: OrganizationMember) => {
    if (!organization) return;

    setLoadingMemberId(member.id);
    try {
      await removeMember(organization.id, member.userId);
    } finally {
      setLoadingMemberId(null);
    }
  };

  const handleRoleChange = async (
    member: OrganizationMember,
    newRole: "admin" | "member" | "owner",
  ) => {
    if (!organization) return;

    setLoadingMemberId(member.id);
    try {
      await updateMemberRole({
        organizationId: organization.id,
        memberId: member.id,
        role: newRole,
      });
    } finally {
      setLoadingMemberId(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Members</DialogTitle>
          <DialogDescription>
            {organization?.name} – Add, remove, or change member roles.
          </DialogDescription>
        </DialogHeader>

        {/* Invite form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <div className="flex gap-2">
            <form.Field
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid} className="flex-1">
                    <FieldLabel htmlFor="invite-email" className="sr-only">
                      Email
                    </FieldLabel>
                    <Input
                      id="invite-email"
                      name={field.name}
                      type="email"
                      placeholder="email@example.com…"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="email"
                      disabled={form.state.isSubmitting}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
            <form.Field
              name="role"
              children={(field) => (
                <Select
                  name={field.name}
                  value={field.state.value}
                  onValueChange={(v) =>
                    field.handleChange(v as "admin" | "member")
                  }
                  disabled={form.state.isSubmitting}
                >
                  <SelectTrigger className="w-28" aria-label="Select role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
              children={({ canSubmit, isSubmitting }) => (
                <LoadingButton
                  type="submit"
                  size="icon"
                  loading={isSubmitting}
                  disabled={!canSubmit}
                  aria-label="Invite member"
                >
                  <UserPlus className="h-4 w-4" />
                </LoadingButton>
              )}
            />
          </div>
        </form>

        <Separator />

        {/* Members list */}
        <ScrollArea className="h-64">
          <div className="space-y-2">
            {members.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">
                No members yet. Invite someone to get started.
              </p>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user.image ?? undefined} />
                      <AvatarFallback>
                        {getInitials(member.user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{member.user.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.role === "owner" ? (
                      <Badge variant="default">Owner</Badge>
                    ) : (
                      <Select
                        value={member.role}
                        onValueChange={(v) =>
                          handleRoleChange(
                            member,
                            v as "admin" | "member" | "owner",
                          )
                        }
                        disabled={loadingMemberId === member.id}
                      >
                        <SelectTrigger
                          className="h-8 w-24"
                          aria-label={`Change role for ${member.user.name}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Member</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    {member.role !== "owner" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive h-8 w-8"
                        onClick={() => handleRemoveMember(member)}
                        disabled={loadingMemberId === member.id}
                        aria-label={`Remove ${member.user.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
