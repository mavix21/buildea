import { CpuIcon, DatabaseIcon, TerminalIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@buildea/ui/components/field";
import { cn } from "@buildea/ui/lib/utils";

import { Link } from "@/shared/i18n";
import { OAuthErrorHandler } from "@/widgets/auth/oauth-error-handler";
import { SignInWithGitHub } from "@/widgets/auth/sign-in-with-github";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const t = useTranslations("auth");

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <OAuthErrorHandler />
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          {/* <a href="#" className="flex flex-col items-center gap-2 font-medium">
            <div className="flex size-8 items-center justify-center rounded-md">
              <HouseHeartIcon className="size-6" />
            </div>
            <span className="sr-only">{tCommon("company_name")}</span>
          </a> */}
          {/* <h1 className="text-xl font-bold">{t("welcome")}</h1> */}
          <span className="inline-block text-xs font-semibold tracking-wider uppercase">
            {t("welcome_prefix")}
          </span>
          <h1
            className="font-heading mb-2 leading-none tracking-wide"
            style={{
              fontSize: "clamp(2.5rem, 8vw, 3.5rem)",
            }}
          >
            <Link href="/">{t("app_name")}</Link>
          </h1>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
        <Field>
          <SignInWithGitHub className="font-pixel text-[11px]" />
        </Field>
        <FieldSeparator backgroundColor="bg-card" className="flex items-center">
          <div className="flex items-center justify-center gap-4">
            <div className="bg-border h-px flex-1" />
            <div className="flex items-center gap-2">
              <TerminalIcon className="size-3" />
              <CpuIcon className="size-3" />
              <DatabaseIcon className="size-3" />
            </div>
            <div className="bg-border h-px flex-1" />
          </div>
        </FieldSeparator>
      </FieldGroup>
      <FieldDescription className="px-6 text-center">
        {t.rich("terms_privacy", {
          terms: (chunks) => <a href="#">{chunks}</a>,
          privacy: (chunks) => <a href="#">{chunks}</a>,
        })}
      </FieldDescription>
    </div>
  );
}
