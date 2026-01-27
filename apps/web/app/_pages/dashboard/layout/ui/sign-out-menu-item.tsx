"use client";

import { IconLogout } from "@tabler/icons-react";

import { DropdownMenuItem } from "@buildea/ui/components/dropdown-menu";

import { useSignOut } from "@/shared/lib";

export default function SignOutMenuItem() {
  const { signOut } = useSignOut();
  return (
    <DropdownMenuItem
      variant="destructive"
      onClick={signOut}
      className="cursor-pointer"
    >
      <IconLogout className="size-4" />
      Sign out
    </DropdownMenuItem>
  );
}
