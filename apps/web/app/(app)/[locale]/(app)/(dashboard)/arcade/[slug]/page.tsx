import { ArcadeDetailPage } from "@/pages/dashboard/arcade/arcade-detail-page";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <ArcadeDetailPage slug={slug} />;
}

// Provide at least one param for build validation, dynamic slugs generated at request time
export function generateStaticParams() {
  return [{ slug: "placeholder" }];
}
