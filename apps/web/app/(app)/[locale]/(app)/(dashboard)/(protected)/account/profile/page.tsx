import type { Metadata } from "next";
import { Suspense } from "react";

import { EditProfileContent } from "@/pages/dashboard/account/ui/edit-profile-content";
import { EditProfileSkeleton } from "@/pages/dashboard/account/ui/edit-profile-skeleton";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Update your public profile information.",
};

export default function ProfilePage() {
  return (
    <Suspense fallback={<EditProfileSkeleton />}>
      <EditProfileContent />
    </Suspense>
  );
}
