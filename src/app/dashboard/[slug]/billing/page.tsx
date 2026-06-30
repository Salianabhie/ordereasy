import { BillingDashboard } from "@/components/dashboard/billing-dashboard";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { isFirebaseEnabled } from "@/lib/firebase/config";
import { getRestaurantForDashboard } from "@/lib/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BillingPage({ params }: PageProps) {
  const { slug } = await params;

  let restaurantName: string | null = null;

  if (isFirebaseEnabled()) {
    const r = await getRestaurantForDashboard(slug);
    if (!r) notFound();
    restaurantName = r.name;
  } else {
    const r = await prisma.restaurant.findUnique({
      where: { slug },
      select: { name: true },
    });
    if (!r) notFound();
    restaurantName = r.name;
  }

  return <BillingDashboard slug={slug} />;
}
