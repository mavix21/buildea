"use client";

import { createFormHook } from "@tanstack/react-form";

import { fieldContext, formContext } from "./form-context";
import { UsernameField } from "./username-field";

export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    UsernameField,
  },
  formComponents: {},
});
