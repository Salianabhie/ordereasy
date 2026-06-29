import { BillingDashboard } from "@/components/dashboard/billing-dashboard";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BillingPage({ params }: PageProps) {
  const { slug } = await params;
  return <BillingDashboard slug={slug} />;
}
