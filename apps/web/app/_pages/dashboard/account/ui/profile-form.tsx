"use client";

import type { Preloaded } from "convex/react";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import { useMutation, usePreloadedQuery, useQuery } from "convex/react";
import { toast } from "sonner";
import { z } from "zod";

import { api } from "@buildea/convex/_generated/api";
import { Card, CardContent, CardHeader } from "@buildea/ui/components/card";
import { CountryDropdown } from "@buildea/ui/components/country-dropdown";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@buildea/ui/components/field";
import { Input } from "@buildea/ui/components/input";
import { LoadingButton } from "@buildea/ui/components/loading-button";
import { Textarea } from "@buildea/ui/components/textarea";

import { AvatarUpload } from "./avatar-upload";
import { SkillsCombobox } from "./skills-combobox";
import { SocialsSection } from "./socials-section";

// Zod validation schema
const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  username: z
    .string()
    .max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_]*$/, "Only letters, numbers, and underscores allowed"),
  bio: z.string().max(500, "Bio too long"),
  countryCode: z.string().max(3),
  skills: z.array(z.string()),
  socials: z.object({
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    telegram: z.string().optional(),
    website: z.string().optional(),
    github: z.string().optional(),
    farcaster: z.string().optional(),
  }),
});

interface ProfileFormProps {
  preloadedProfile: Preloaded<typeof api.mutations.profile.getMyProfile>;
}

// Separate client component for username field that can use hooks
function UsernameFieldWithValidation({
  value,
  name,
  isTouched,
  syncErrors,
  isSubmitting,
  onBlur,
  onChange,
}: {
  value: string;
  name: string;
  isTouched: boolean;
  syncErrors: ({ message?: string } | undefined)[] | undefined;
  isSubmitting: boolean;
  onBlur: () => void;
  onChange: (value: string) => void;
}) {
  // Use Convex query reactively - only check when there's a value
  const isAvailable = useQuery(
    api.mutations.profile.checkUsernameAvailable,
    value ? { username: value } : "skip",
  );

  // Show availability error only if we got a response and username is taken
  const availabilityError =
    isAvailable === false ? "Username already taken" : undefined;
  // Combine sync errors with availability error
  const errorMessages =
    syncErrors ??
    (availabilityError ? [{ message: availabilityError }] : undefined);
  const isInvalid = isTouched && errorMessages !== undefined;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor="profile-username">Username</FieldLabel>
      <Input
        id="profile-username"
        name={name}
        value={value}
        onBlur={onBlur}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder="your_username"
        disabled={isSubmitting}
      />
      <FieldDescription>
        Your unique profile URL: buildea.xyz/dashboard/b/
        {value || "username"}
      </FieldDescription>
      {isInvalid ? <FieldError errors={errorMessages} /> : null}
    </Field>
  );
}

export function ProfileForm({ preloadedProfile }: ProfileFormProps) {
  const profile = usePreloadedQuery(preloadedProfile);
  const updateAuthProfile = useMutation(
    api.mutations.profile.updateAuthProfile,
  );
  const updateProfile = useMutation(api.mutations.profile.updateProfile);

  const form = useForm({
    defaultValues: {
      name: profile.name,
      username: profile.username ?? "",
      bio: profile.bio ?? "",
      countryCode: profile.countryCode ?? "",
      skills: profile.skills,
      socials: profile.socials,
    },
    validationLogic: revalidateLogic({ mode: "change" }),
    validators: {
      onDynamic: profileFormSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        // Update auth user (name, username)
        await updateAuthProfile({
          name: value.name,
          username: value.username || undefined,
        });

        // Update app user (bio, countryCode, skills, socials)
        await updateProfile({
          bio: value.bio || undefined,
          countryCode: value.countryCode || undefined,
          skills: value.skills,
          socials: value.socials,
        });

        toast.success("Profile updated successfully");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to update profile",
        );
      }
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Edit Profile</h1>
        <p className="text-muted-foreground">
          Update your public profile information
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void form.handleSubmit();
        }}
        className="space-y-6"
      >
        {/* Avatar Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Profile Picture</h3>
          </CardHeader>
          <CardContent>
            <AvatarUpload
              currentAvatarUrl={profile.avatarUrl}
              name={profile.name}
            />
          </CardContent>
        </Card>

        {/* Basic Info Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Basic Information</h3>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const errors = field.state.meta.errorMap.onDynamic;
                  const isInvalid =
                    field.state.meta.isTouched && errors !== undefined;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="profile-name">Name</FieldLabel>
                      <Input
                        id="profile-name"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Your display name"
                        disabled={form.state.isSubmitting}
                      />
                      {isInvalid ? <FieldError errors={errors} /> : null}
                    </Field>
                  );
                }}
              />

              <form.Field
                name="username"
                children={(field) => (
                  <UsernameFieldWithValidation
                    value={field.state.value}
                    name={field.name}
                    isTouched={field.state.meta.isTouched}
                    syncErrors={field.state.meta.errorMap.onDynamic}
                    isSubmitting={form.state.isSubmitting}
                    onBlur={field.handleBlur}
                    onChange={field.handleChange}
                  />
                )}
              />

              <form.Field
                name="bio"
                children={(field) => {
                  const errors = field.state.meta.errorMap.onDynamic;
                  const isInvalid =
                    field.state.meta.isTouched && errors !== undefined;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
                      <Textarea
                        id="profile-bio"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        placeholder="Tell others about yourself..."
                        rows={4}
                        disabled={form.state.isSubmitting}
                      />
                      <FieldDescription>
                        {field.state.value.length}/500 characters
                      </FieldDescription>
                      {isInvalid ? <FieldError errors={errors} /> : null}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Location Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Location</h3>
          </CardHeader>
          <CardContent>
            <form.Field
              name="countryCode"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor="profile-country">Country</FieldLabel>
                  <CountryDropdown
                    defaultValue={field.state.value}
                    onChange={(country) => field.handleChange(country.alpha3)}
                    disabled={form.state.isSubmitting}
                    placeholder="Select your country"
                  />
                  <FieldDescription>
                    Help us show where our builders are from
                  </FieldDescription>
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Skills</h3>
          </CardHeader>
          <CardContent>
            <form.Field
              name="skills"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor="profile-skills">Your Skills</FieldLabel>
                  <SkillsCombobox
                    value={field.state.value}
                    onChange={field.handleChange}
                    disabled={form.state.isSubmitting}
                  />
                  <FieldDescription>
                    Select skills that showcase your expertise
                  </FieldDescription>
                </Field>
              )}
            />
          </CardContent>
        </Card>

        {/* Social Links Section */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Social Links</h3>
          </CardHeader>
          <CardContent>
            <form.Field
              name="socials"
              children={(field) => (
                <SocialsSection
                  value={field.state.value}
                  onChange={field.handleChange}
                  disabled={form.state.isSubmitting}
                />
              )}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
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
        </div>
      </form>
    </main>
  );
}
