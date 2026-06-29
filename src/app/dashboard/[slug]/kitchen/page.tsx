import { KitchenDisplay } from "@/components/dashboard/kitchen-display";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function KitchenPage({ params }: PageProps) {
  const { slug } = await params;
  return <KitchenDisplay slug={slug} />;
}
