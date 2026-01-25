import type { Metadata } from "next";

import { OrganizationsPage } from "@/pages/dashboard/admin/organizations";

export const metadata: Metadata = {
  title: "Admin - Organizations",
  description: "Manage all organizations in the system.",
};

export default function AdminOrganizationsPage() {
  // Server-side admin check
  // const adminStatus = await isAdmin();
  // if (!adminStatus) {
  //   redirect("/dashboard");
  // }

  return <OrganizationsPage />;
}
