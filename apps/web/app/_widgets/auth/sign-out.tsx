"use client";

import { useSignOut } from "@/shared/lib";

interface SignOutButtonProps {
  redirectUrl?: string;
}

export default function SignOutButton({
  redirectUrl = "/login",
}: SignOutButtonProps) {
  const { signOut } = useSignOut({ redirectUrl });

  return (
    <button
      onClick={signOut}
      className="flex w-full items-center justify-between gap-4"
    >
      <span>Sign out</span>
    </button>
  );
}
