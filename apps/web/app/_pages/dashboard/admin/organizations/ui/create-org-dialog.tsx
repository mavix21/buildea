"use client";

import * as React from "react";
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
  DialogTrigger,
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

import { useOrganizationMutations } from "../model/use-organization-mutations";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

const createOrgSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters.")
    .max(50, "Name must be at most 50 characters."),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters.")
    .max(50, "Slug must be at most 50 characters.")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens.",
    ),
});

interface CreateOrgDialogProps {
  children?: React.ReactNode;
}

export function CreateOrgDialog({ children }: CreateOrgDialogProps) {
  const { createOrganization } = useOrganizationMutations();
  const [open, setOpen] = React.useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      slug: "",
    },
    validators: {
      onChange: createOrgSchema,
    },
    onSubmit: async ({ value }) => {
      const result = await createOrganization(value);
      if (result) {
        setOpen(false);
        form.reset();
        setSlugManuallyEdited(false);
      }
    },
  });

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      form.reset();
      setSlugManuallyEdited(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ?? <Button>Create Organization</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
            <DialogDescription>
              Create a new organization. You can add members after creation.
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
                      <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          const newValue = e.target.value;
                          field.handleChange(newValue);
                          if (!slugManuallyEdited) {
                            form.setFieldValue("slug", slugify(newValue));
                          }
                        }}
                        aria-invalid={isInvalid}
                        placeholder="Acme Inc…"
                        autoComplete="organization"
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
                name="slug"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => {
                          field.handleChange(slugify(e.target.value));
                          setSlugManuallyEdited(true);
                        }}
                        aria-invalid={isInvalid}
                        placeholder="acme-inc"
                        autoComplete="off"
                        spellCheck={false}
                        disabled={form.state.isSubmitting}
                      />
                      <FieldDescription>
                        This will be used in URLs and cannot be changed later.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
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
                  Create
                </LoadingButton>
              )}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
