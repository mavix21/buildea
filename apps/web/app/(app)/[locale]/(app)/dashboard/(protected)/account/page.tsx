import { redirect } from "next/navigation";

export default async function AccountPage({
  params,
}: LayoutProps<"/[locale]/dashboard/account">) {
  const { locale } = await params;
  redirect(`/${locale}/dashboard/account/profile`);
}
