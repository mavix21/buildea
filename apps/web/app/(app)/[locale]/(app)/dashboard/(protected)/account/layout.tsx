import { ScrollArea } from "@buildea/ui/components/scroll-area";

import { AccountNav } from "@/pages/dashboard/account/ui/account-nav";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ScrollArea className="h-[calc(100svh-3.5rem-1rem)]">
      <div className="relative mx-auto grid max-w-5xl grid-cols-1 gap-6 p-4 md:grid-cols-[200px_1fr]">
        <div className="sticky top-4 self-start">
          <AccountNav />
        </div>
        <div className="flex-1">{children}</div>
      </div>
    </ScrollArea>
  );
}
