import { redirect } from "next/navigation";

export default async function AccountPage({
  params,
}: LayoutProps<"/[locale]/account">) {
  const { locale } = await params;
  redirect(`/${locale}/account/profile`);
}
