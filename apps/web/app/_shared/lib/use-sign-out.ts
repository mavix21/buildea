import { toast } from "sonner";

import { authClient } from "@/auth/client";

import { useRouter } from "../i18n";

interface UseSignOutOptions {
  redirectUrl?: string;
}

export function useSignOut({ redirectUrl = "/login" }: UseSignOutOptions = {}) {
  const router = useRouter();

  const signOut = () => {
    const signOutPromise = authClient.signOut().then(() => {
      router.push(redirectUrl);
      authClient.$store.notify("$sessionSignal");
    });

    toast.promise(signOutPromise, {
      loading: "Signing out...",
      success: "Signed out successfully!",
      error: "Failed to sign out",
    });
  };

  return { signOut };
}
