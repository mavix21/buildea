import { SidebarInset, SidebarProvider } from "@buildea/ui/components/sidebar";

import AppSidebar from "@/pages/dashboard/layout/ui/app-sidebar";

export default function DashboardLayour({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
