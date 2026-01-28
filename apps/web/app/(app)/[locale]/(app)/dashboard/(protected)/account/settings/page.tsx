import type { Metadata } from "next";

import { Card, CardContent, CardHeader } from "@buildea/ui/components/card";

export const metadata: Metadata = {
  title: "Account Settings",
  description: "Manage your account settings.",
};

export default function SettingsPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your account preferences and security
        </p>
      </div>
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Coming Soon</h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Account settings such as email preferences, security options, and
            danger zone will be available here.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
