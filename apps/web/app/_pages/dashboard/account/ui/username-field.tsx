"use client";

import type { useConvex } from "convex/react";
import { Check, CircleAlert, Loader2 } from "lucide-react";

import { api } from "@buildea/convex/_generated/api";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@buildea/ui/components/field";
import { Input } from "@buildea/ui/components/input";

import { useFieldContext } from "./form-context";

export function UsernameField() {
  const field = useFieldContext<string>();

  const value = field.state.value;
  const isDirty = field.state.meta.isDirty;
  const isValidating = field.state.meta.isValidating;
  const errors = field.state.meta.errors;
  const isSubmitting = field.form.state.isSubmitting;

  const isInvalid = errors.length > 0;

  // Show success only if:
  // 1. Field is dirty (user changed it)
  // 2. No errors (both sync and async passed)
  // 3. Not currently validating
  // 4. Value is present
  const showSuccess =
    isDirty && !isInvalid && !isValidating && value.length > 0;

  return (
    <Field data-invalid={isInvalid} data-valid={showSuccess}>
      <FieldLabel htmlFor="profile-username">Username</FieldLabel>
      <div className="relative">
        <Input
          id="profile-username"
          name={field.name}
          value={value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid ? true : undefined}
          placeholder="your_username"
          disabled={isSubmitting}
          className={
            showSuccess
              ? "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/20"
              : ""
          }
        />
        <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2">
          {isValidating ? (
            <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
          ) : showSuccess ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : isInvalid ? (
            <CircleAlert className="text-destructive h-4 w-4" />
          ) : null}
        </div>
      </div>
      <FieldDescription>
        Your unique profile URL: buildea.dev/b/
        {value || "username"}
      </FieldDescription>
      <div className="min-h-[20px]">
        {isValidating ? (
          <p className="text-muted-foreground flex items-center gap-2 text-[0.8rem]">
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking availability...
          </p>
        ) : isInvalid ? (
          <FieldError errors={errors} />
        ) : showSuccess ? (
          <p className="flex items-center gap-2 text-[0.8rem] font-medium text-green-500">
            <Check className="size-3" />
            Username is available
          </p>
        ) : null}
      </div>
    </Field>
  );
}

// Re-export async validator for username to be used in form.AppField
export async function validateUsernameAsync(
  value: string,
  convex: ReturnType<typeof useConvex>,
): Promise<string | undefined> {
  if (!value) return undefined;
  const isAvailable = await convex.query(
    api.mutations.profile.checkUsernameAvailable,
    { username: value },
  );
  return isAvailable ? undefined : "Username is already taken";
}
