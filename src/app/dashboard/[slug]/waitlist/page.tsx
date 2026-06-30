import { WaitlistManager } from "@/components/dashboard/waitlist-manager";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function WaitlistPage({ params }: PageProps) {
  const { slug } = await params;
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
  });

  if (!restaurant) notFound();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <WaitlistManager restaurantSlug={slug} />
    </div>
  );
}
