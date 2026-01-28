import { api } from "@buildea/convex/_generated/api";

import { preloadAuthQuery } from "@/auth/server";

import { ProfileForm } from "./profile-form";

export async function EditProfileContent() {
  const preloadedProfile = await preloadAuthQuery(
    api.mutations.profile.getMyProfile,
  );

  return <ProfileForm preloadedProfile={preloadedProfile} />;
}
