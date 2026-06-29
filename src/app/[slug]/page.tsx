import { WelcomeScreen } from "@/components/order/welcome-screen";
import { getRestaurantBySlug } from "@/lib/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}

export default async function QRLandingPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { table } = await searchParams;
  const tableNumber = table ?? "1";

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return <WelcomeScreen restaurant={restaurant} tableNumber={tableNumber} />;
}
