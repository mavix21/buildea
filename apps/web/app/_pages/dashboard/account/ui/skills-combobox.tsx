"use client";

import { useState } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";

import { Badge } from "@buildea/ui/components/badge";
import { Button } from "@buildea/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@buildea/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@buildea/ui/components/popover";
import { cn } from "@buildea/ui/lib/utils";

const AVAILABLE_SKILLS = [
  // Web Development
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "HTML/CSS",
  "Tailwind CSS",
  "Node.js",
  "Express",
  "GraphQL",
  "REST APIs",
  // Blockchain
  "Solidity",
  "Smart Contracts",
  "Web3",
  "Ethereum",
  "DeFi",
  "NFTs",
  "Hardhat",
  "Foundry",
  // Mobile
  "React Native",
  "Expo",
  "iOS",
  "Android",
  "Flutter",
  // Backend
  "Python",
  "Go",
  "Rust",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  // DevOps & Cloud
  "AWS",
  "GCP",
  "Docker",
  "Kubernetes",
  "CI/CD",
  // Design
  "UI/UX Design",
  "Figma",
  "Product Design",
  // Other
  "AI/ML",
  "Data Science",
  "Technical Writing",
  "Open Source",
] as const;

interface SkillsComboboxProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function SkillsCombobox({
  value,
  onChange,
  disabled,
}: SkillsComboboxProps) {
  const [open, setOpen] = useState(false);

  const toggleSkill = (skill: string) => {
    if (value.includes(skill)) {
      onChange(value.filter((s) => s !== skill));
    } else {
      onChange([...value, skill]);
    }
  };

  const removeSkill = (skill: string) => {
    onChange(value.filter((s) => s !== skill));
  };

  return (
    <div className="space-y-3">
      {/* Selected skills as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill) => (
            <Badge key={skill} variant="secondary" className="gap-1 pr-1">
              {skill}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeSkill(skill)}
                disabled={disabled}
              >
                <IconX className="h-3 w-3" />
                <span className="sr-only">Remove {skill}</span>
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Combobox trigger */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-start"
            disabled={disabled}
          >
            {value.length === 0
              ? "Select skills..."
              : `${value.length} skill${value.length > 1 ? "s" : ""} selected`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Search skills..." />
            <CommandList>
              <CommandEmpty>No skill found.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {AVAILABLE_SKILLS.map((skill) => {
                  const isSelected = value.includes(skill);
                  return (
                    <CommandItem
                      key={skill}
                      value={skill}
                      onSelect={() => toggleSkill(skill)}
                    >
                      <div
                        className={cn(
                          "border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                          isSelected
                            ? "bg-primary text-primary-foreground"
                            : "opacity-50 [&_svg]:invisible",
                        )}
                      >
                        <IconCheck className="h-3 w-3" />
                      </div>
                      {skill}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
