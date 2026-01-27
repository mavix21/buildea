import { IconMoodSad } from "@tabler/icons-react";

import { Card, CardContent } from "@buildea/ui/components/card";

export function ProfileNotFound() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center gap-4 pt-6 text-center">
          <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
            <IconMoodSad className="text-muted-foreground h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Perfil no encontrado</h2>
            <p className="text-muted-foreground text-sm">
              El perfil de builder que buscas no existe o ha sido eliminado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
