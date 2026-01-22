"use client";

import type { ReactNode } from "react";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieToInitialState, WagmiProvider } from "wagmi";

import { getConfig } from "../_config/wagmi";

export function OnchainKitClientProvider({
  children,
  cookie,
}: {
  children: ReactNode;
  cookie: string | null;
}) {
  const [config] = React.useState(() => getConfig());
  const [queryClient] = React.useState(() => new QueryClient());

  const initialState = cookieToInitialState(config, cookie);

  return (
    <WagmiProvider config={config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
