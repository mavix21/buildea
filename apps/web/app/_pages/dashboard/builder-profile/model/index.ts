import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandTelegram,
  IconBrandTwitter,
} from "@tabler/icons-react";

import type { Doc } from "@buildea/convex/_generated/dataModel";

export type Socials = Doc<"users">["socials"];

export const SocialIcons = {
  linkedin: IconBrandLinkedin,
  twitter: IconBrandTwitter,
  github: IconBrandGithub,
  telegram: IconBrandTelegram,
} as const;
