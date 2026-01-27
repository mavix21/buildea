import { IconTrophy } from "@tabler/icons-react";

import { Button } from "@buildea/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@buildea/ui/components/card";

export function AchievementsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-pixel text-sm">Logros</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-muted-foreground flex items-center gap-2 text-sm">
          <IconTrophy className="h-4 w-4" />
          <span>¿Quieres ganar tu primer logro?</span>
        </div>
        <p className="text-muted-foreground text-xs">
          Completa un curso para recibir una insignia.
        </p>
        <Button variant="outline" className="w-full" size="sm">
          Explorar cursos
        </Button>
      </CardContent>
    </Card>
  );
}
