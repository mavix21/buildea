import { Geist, Geist_Mono } from "next/font/google";

import "@myapp/ui/globals.css";

import type { Metadata } from "next";

import { ThemeProvider } from "@myapp/features/app/providers";
import { Toaster } from "@myapp/ui/components/sonner";

import { MiniAppProvider } from "@/shared/context";

const fontSans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Next.js Monorepo Template",
  description: "Next.js Monorepo Template",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <MiniAppProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </MiniAppProvider>
      </body>
    </html>
  );
}
