"use client";

import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@buildea/ui/lib/utils";

import { buttonVariants } from "./button";
import { Spinner } from "./spinner";

interface LoadingButtonContextValue {
  loading: boolean;
}

const LoadingButtonContext = React.createContext<LoadingButtonContextValue>({
  loading: false,
});

const useLoadingButton = () => React.useContext(LoadingButtonContext);

interface LoadingButtonProps
  extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function LoadingButton({
  className,
  variant,
  size,
  children,
  disabled,
  asChild = false,
  loading = false,
  ...props
}: LoadingButtonProps) {
  const Comp = asChild ? Slot : "button";

  return (
    <LoadingButtonContext.Provider value={{ loading: loading ?? false }}>
      <Comp
        data-slot="button"
        data-loading={loading ? true : undefined}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={loading ?? disabled}
        {...props}
      >
        {children}
      </Comp>
    </LoadingButtonContext.Provider>
  );
}

interface LoadingButtonContentProps {
  children: React.ReactNode;
  loadingContent?: React.ReactNode;
  className?: string;
  /** Loading content to display (defaults to Spinner + "Loading...") */
  loadingText?: string;
  /** Animation duration in seconds */
  duration?: number;
}

function LoadingButtonContent({
  children,
  loadingContent,
  loadingText = "Loading...",
  className,
  duration = 0.15,
}: LoadingButtonContentProps) {
  const { loading } = useLoadingButton();

  const defaultLoadingContent = (
    <>
      <Spinner />
      {loadingText}
    </>
  );

  return (
    <AnimatePresence mode="wait" initial={false}>
      {loading ? (
        <motion.span
          key="loading"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration }}
          className={cn("flex items-center gap-2", className)}
        >
          {loadingContent ?? defaultLoadingContent}
        </motion.span>
      ) : (
        <motion.span
          key="idle"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration }}
          className={cn("flex items-center gap-2", className)}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  );
}

export {
  LoadingButton,
  LoadingButtonContent,
  useLoadingButton,
  type LoadingButtonProps,
  type LoadingButtonContentProps,
};
