import { prisma } from "@/lib/prisma";
import { getRestaurantForDashboard } from "@/lib/data";
import { notFound } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { isFirebaseEnabled } from "@/lib/firebase/config";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}

export default async function DashboardLayout({
  children,
  params,
}: LayoutProps) {
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

  return (
    <div className="min-h-screen bg-[#080808] text-white flex font-cyber-data">
      <DashboardSidebar slug={slug} restaurantName={restaurantName} />
      <main className="flex-1 min-w-0">
        <div className="p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
