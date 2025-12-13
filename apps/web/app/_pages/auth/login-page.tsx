import { Card, CardContent } from "@buildea/ui/components/card";

import { DitherBackground } from "../marketing/ui";
import { LoginForm } from "./ui/login-form";

export function LoginPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <DitherBackground />
      <div className="relative z-1 w-full max-w-sm">
        <Card>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
