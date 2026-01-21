import { SidebarInset, SidebarProvider } from "@buildea/ui/components/sidebar";

import AppSidebar from "@/pages/dashboard/layout/ui/app-sidebar";
import Header from "@/pages/dashboard/layout/ui/header";

export default function DashboardLayour({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
