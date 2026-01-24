"use client";

import { useEffect } from "react";
import { IconBug } from "@tabler/icons-react";

import { Button } from "@buildea/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@buildea/ui/components/empty";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconBug />
        </EmptyMedia>
        <EmptyTitle>Uy, algo salió mal</EmptyTitle>
        <EmptyDescription>
          La página no pudo cargarse. Por favor, intenta de nuevo. Si el
          problema persiste, contacta al soporte.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button variant="outline" onClick={() => reset()}>
          Intentar de nuevo
        </Button>
      </EmptyContent>
    </Empty>
  );
}
