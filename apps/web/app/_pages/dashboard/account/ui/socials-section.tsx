"use client";

import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTelegram,
  IconBrandX,
  IconMessage,
  IconWorld,
} from "@tabler/icons-react";

import { Field, FieldGroup, FieldLabel } from "@buildea/ui/components/field";
import { Input } from "@buildea/ui/components/input";

interface Socials {
  twitter?: string;
  linkedin?: string;
  telegram?: string;
  website?: string;
  github?: string;
  farcaster?: string;
}

const socialFields = [
  {
    key: "website" as const,
    label: "Website",
    icon: IconWorld,
    placeholder: "https://yourwebsite.com",
  },
  {
    key: "twitter" as const,
    label: "(Twitter)",
    icon: IconBrandX,
    placeholder: "https://x.com/username",
  },
  {
    key: "github" as const,
    label: "GitHub",
    icon: IconBrandGithub,
    placeholder: "https://github.com/username",
  },
  {
    key: "linkedin" as const,
    label: "LinkedIn",
    icon: IconBrandLinkedin,
    placeholder: "https://linkedin.com/in/username",
  },
  {
    key: "farcaster" as const,
    label: "Farcaster",
    icon: IconMessage,
    placeholder: "https://warpcast.com/username",
  },
  {
    key: "telegram" as const,
    label: "Telegram",
    icon: IconBrandTelegram,
    placeholder: "https://t.me/username",
  },
];

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
      {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
        <Field key={key} orientation="horizontal">
          <FieldLabel
            htmlFor={`social-${key}`}
            className="flex w-40 items-center gap-2"
          >
            <Icon className="size-4" />
            <span>{label}</span>
          </FieldLabel>
          <Input
            id={`social-${key}`}
            type="url"
            value={value[key] ?? ""}
            onChange={(e) => handleChange(key, e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        </Field>
      ))}
    </FieldGroup>
  );
}
