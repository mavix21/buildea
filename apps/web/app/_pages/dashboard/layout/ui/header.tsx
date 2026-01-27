import { Separator } from "@buildea/ui/components/separator";
import { SidebarTrigger } from "@buildea/ui/components/sidebar";

import { ModeToggle } from "@/shared/ui";

export default function Header() {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
      </div>

      <div className="flex items-center gap-2 px-4">
        <ModeToggle />
      </div>
    </header>
  );
}
