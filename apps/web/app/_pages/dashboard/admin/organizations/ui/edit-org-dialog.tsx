"use client";

import { useForm } from "@tanstack/react-form";
import * as z from "zod";

import { Button } from "@buildea/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@buildea/ui/components/dialog";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@buildea/ui/components/field";
import { Input } from "@buildea/ui/components/input";
import { LoadingButton } from "@buildea/ui/components/loading-button";

import type { Organization } from "../model/organization.types";
import { useOrganizationMutations } from "../model/use-organization-mutations";

const editOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters."),
});

interface EditOrgDialogProps {
  organization: Organization | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditOrgDialog({
  organization,
  open,
  onOpenChange,
}: EditOrgDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {organization && (
          <EditOrgForm
            key={organization.id}
            organization={organization}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface EditOrgFormProps {
  organization: Organization;
  onOpenChange: (open: boolean) => void;
}

function EditOrgForm({ organization, onOpenChange }: EditOrgFormProps) {
  const { updateOrganization } = useOrganizationMutations();

  const form = useForm({
    defaultValues: {
      name: organization.name,
    },
    validators: {
      onChange: editOrgSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await updateOrganization(organization.id, value);
      if (result) {
        onOpenChange(false);
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <DialogHeader>
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogDescription>
          Update organization details. Slug cannot be changed.
        </DialogDescription>
      </DialogHeader>
      <div className="py-4">
        <FieldGroup>
          <form.Field
            name="name"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor="edit-org-name">Name</FieldLabel>
                  <Input
                    id="edit-org-name"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Acme Inc…"
                    autoComplete="organization"
                    disabled={form.state.isSubmitting}
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
          <Field>
            <FieldLabel htmlFor="edit-org-slug">Slug</FieldLabel>
            <Input
              id="edit-org-slug"
              value={organization.slug}
              disabled
              className="bg-muted"
              aria-readonly="true"
            />
            <FieldDescription>
              Slug cannot be changed after creation.
            </FieldDescription>
          </Field>
        </FieldGroup>
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={form.state.isSubmitting}
        >
          Cancel
        </Button>
        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
          })}
          children={({ canSubmit, isSubmitting }) => (
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              disabled={!canSubmit}
            >
              Save Changes
            </LoadingButton>
          )}
        />
      </DialogFooter>
    </form>
  );
}
