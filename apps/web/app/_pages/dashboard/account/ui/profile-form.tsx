"use client";

import type { Preloaded } from "convex/react";
import { useConvex, useMutation, usePreloadedQuery } from "convex/react";
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
import {
  LoadingButton,
  LoadingButtonContent,
} from "@buildea/ui/components/loading-button";
import { Textarea } from "@buildea/ui/components/textarea";

import { AvatarUpload } from "./avatar-upload";
import { useAppForm } from "./form-hook";
import { SkillsCombobox } from "./skills-combobox";
import { SocialsSection } from "./socials-section";
import { validateUsernameAsync } from "./username-field";

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

export function ProfileForm({ preloadedProfile }: ProfileFormProps) {
  const profile = usePreloadedQuery(preloadedProfile);
  const updateAuthProfile = useMutation(
    api.mutations.profile.updateAuthProfile,
  );
  const updateProfile = useMutation(api.mutations.profile.updateProfile);
  const convex = useConvex();

  const form = useAppForm({
    defaultValues: {
      name: profile.name,
      username: profile.username ?? "",
      bio: profile.bio ?? "",
      countryCode: profile.countryCode ?? "",
      skills: profile.skills,
      socials: profile.socials,
    },
    validators: {
      onChange: profileFormSchema,
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
    <main className="flex flex-1 flex-col gap-6 pt-0">
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
            <h3 className="font-pixel text-sm">Profile Picture</h3>
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
            <h3 className="font-pixel text-sm">Basic Information</h3>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <form.Field
                name="name"
                children={(field) => {
                  const errors = field.state.meta.errorMap.onChange;
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
              <form.AppField
                name="username"
                asyncDebounceMs={500}
                validators={{
                  onChangeAsync: async ({ value }) =>
                    validateUsernameAsync(value, convex),
                }}
              >
                {(field) => <field.UsernameField />}
              </form.AppField>
              <form.Field
                name="bio"
                children={(field) => {
                  const errors = field.state.meta.errorMap.onChange;
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
            <h3 className="font-pixel text-sm">Location</h3>
          </CardHeader>
          <CardContent>
            <form.Field
              name="countryCode"
              children={(field) => (
                <Field>
                  <FieldLabel htmlFor="profile-country">Country</FieldLabel>
                  <CountryDropdown
                    defaultValue={field.state.value}
                    onChange={(country) => field.handleChange(country.alpha2)}
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
            <h3 className="font-pixel text-sm">Skills</h3>
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
            <h3 className="font-pixel text-sm">Social Links</h3>
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
                <LoadingButtonContent loadingText="Saving...">
                  Save Changes
                </LoadingButtonContent>
              </LoadingButton>
            )}
          />
        </div>
      </form>
    </main>
  );
}
