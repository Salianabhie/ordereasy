import { TablesManager } from "@/components/dashboard/tables-manager";
import { getTables } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { isFirebaseEnabled } from "@/lib/firebase/config";
import { getRestaurantForDashboard } from "@/lib/data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TablesPage({ params }: PageProps) {
  const { slug } = await params;
  const tables = await getTables(slug);
  if (!tables) notFound();

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

  return <TablesManager slug={slug} tables={tables} />;
}
