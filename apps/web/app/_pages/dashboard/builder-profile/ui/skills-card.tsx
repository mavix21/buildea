import { IconPencil } from "@tabler/icons-react";

import { Button } from "@buildea/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@buildea/ui/components/card";

interface SkillsCardProps {
  skills: string[];
}

export function SkillsCard({ skills }: SkillsCardProps) {
  const hasSkills = skills.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-pixel text-sm">Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasSkills ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <>
            <p className="text-muted-foreground text-sm">
              Aún no has agregado skills.
            </p>
            <Button variant="outline" className="w-full" size="sm">
              <IconPencil className="mr-2 h-4 w-4" />
              Agregar skills
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
