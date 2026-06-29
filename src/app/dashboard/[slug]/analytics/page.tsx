import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function AnalyticsPage({ params }: PageProps) {
  const { slug } = await params;
  return <AnalyticsDashboard slug={slug} />;
}
