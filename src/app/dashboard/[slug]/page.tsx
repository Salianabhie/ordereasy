import { DashboardOverview } from "@/components/dashboard/overview";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { slug } = await params;
  return <DashboardOverview slug={slug} />;
}
