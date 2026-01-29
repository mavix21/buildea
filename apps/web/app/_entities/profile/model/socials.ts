import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTelegram,
  IconBrandX,
  IconGlobe,
  IconMessage,
} from "@tabler/icons-react";

import type { Doc } from "@buildea/convex/_generated/dataModel";

import type { Icon } from "@/shared/ui/icons";

export type Socials = Doc<"users">["socials"];
type Social = keyof Socials;

export const SocialIcons = {
  linkedin: IconBrandLinkedin,
  twitter: IconBrandX,
  github: IconBrandGithub,
  telegram: IconBrandTelegram,
  website: IconGlobe,
  farcaster: IconMessage,
} as const satisfies Record<Social, Icon>;

export const socialFields = {
  // {
  //   key: "website" as const,
  //   label: "Website",
  //   icon: IconWorld,
  //   placeholder: "https://yourwebsite.com",
  // },
  twitter: {
    key: "twitter" as const,
    label: "(Twitter)",
    icon: IconBrandX,
    prefix: "https://x.com/",
  },
  github: {
    key: "github" as const,
    label: "GitHub",
    icon: IconBrandGithub,
    prefix: "https://github.com/",
  },
  linkedin: {
    key: "linkedin" as const,
    label: "LinkedIn",
    icon: IconBrandLinkedin,
    prefix: "https://linkedin.com/in/",
  },
  farcaster: {
    key: "farcaster" as const,
    label: "Farcaster",
    icon: IconMessage,
    prefix: "https://farcaster.xyz/",
  },
  telegram: {
    key: "telegram" as const,
    label: "Telegram",
    icon: IconBrandTelegram,
    prefix: "https://t.me/",
  },
  website: {
    key: "website" as const,
    label: "Website",
    icon: IconGlobe,
    prefix: "https://",
  },
};
