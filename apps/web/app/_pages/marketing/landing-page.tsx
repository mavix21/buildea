import {
  Code2Icon,
  CpuIcon,
  DatabaseIcon,
  GlobeIcon,
  RocketIcon,
  StarIcon,
  TerminalIcon,
  ZapIcon,
} from "lucide-react";

import { DitherBackground, FloatingPixelIcon, LandingHeader } from "./ui";
import { HeroSection } from "./ui/hero-section";
import { NavItems } from "./ui/nav-items";

export function LandingPage() {
  return (
    <div className="relative min-h-svh">
      <DitherBackground />

      {/* Floating pixel icons */}
      <FloatingPixelIcons />

      <LandingHeader>
        <NavItems />
      </LandingHeader>

      {/* Hero Section */}
      <main className="relative z-1 flex min-h-svh flex-col">
        <HeroSection className="my-auto" />
      </main>
    </div>
  );
}

function FloatingPixelIcons() {
  return (
    <>
      <FloatingPixelIcon
        icon={TerminalIcon}
        className="animate-float top-[15%] left-[10%]"
        delay={0}
        size={32}
      />
      <FloatingPixelIcon
        icon={CpuIcon}
        className="animate-float-reverse top-[25%] right-[15%]"
        delay={0.5}
        size={28}
      />
      <FloatingPixelIcon
        icon={DatabaseIcon}
        className="animate-float-slow top-[60%] left-[8%]"
        delay={1}
        size={24}
      />
      <FloatingPixelIcon
        icon={Code2Icon}
        className="animate-float top-[70%] right-[10%]"
        delay={1.5}
        size={36}
      />
      <FloatingPixelIcon
        icon={RocketIcon}
        className="animate-float-reverse top-[40%] left-[5%]"
        delay={2}
        size={30}
      />
      <FloatingPixelIcon
        icon={ZapIcon}
        className="animate-float-slow right-[20%] bottom-[20%]"
        delay={0.8}
        size={26}
      />
      <FloatingPixelIcon
        icon={StarIcon}
        className="animate-float top-[20%] left-[30%]"
        delay={1.2}
        size={20}
      />
      <FloatingPixelIcon
        icon={GlobeIcon}
        className="animate-float-reverse bottom-[30%] left-[15%]"
        delay={1.8}
        size={28}
      />
    </>
  );
}
