import { SidebarInset, SidebarProvider } from "@buildea/ui/components/sidebar";

import { ClientAuthBoundary } from "@/app/_providers/client-auth-boundary";
import AppSidebar from "@/pages/dashboard/layout/ui/app-sidebar";
import Header from "@/pages/dashboard/layout/ui/header";

export default function DashboardLayour({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthBoundary>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ClientAuthBoundary>
  );
}
