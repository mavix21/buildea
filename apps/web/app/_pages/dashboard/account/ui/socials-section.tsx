"use client";

import { Field, FieldGroup, FieldLabel } from "@buildea/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@buildea/ui/components/input-group";

import type { Socials } from "@/entities/profile/model/socials";
import { socialFields } from "@/entities/profile/model/socials";

interface SocialsSectionProps {
  value: Socials;
  onChange: (value: Socials) => void;
  disabled?: boolean;
}

export function SocialsSection({
  value,
  onChange,
  disabled,
}: SocialsSectionProps) {
  const handleChange = (key: keyof Socials, newValue: string) => {
    onChange({
      ...value,
      [key]: newValue || undefined,
    });
  };

  return (
    <FieldGroup>
      {Object.values(socialFields).map(({ key, label, icon: Icon, prefix }) => (
        <Field key={key} orientation="horizontal">
          <FieldLabel
            htmlFor={`social-${key}`}
            className="flex w-40 items-center gap-2"
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>{prefix}</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id={`social-${key}`}
              className="pl-0!"
              value={value[key] ?? ""}
              onChange={(e) => handleChange(key, e.target.value)}
              disabled={disabled}
            />
          </InputGroup>
        </Field>
      ))}
    </FieldGroup>
  );
}
