import { OrderMenu } from "@/components/order/order-menu";
import { getRestaurantBySlug } from "@/lib/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ table?: string }>;
}

export default async function OrderPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { table } = await searchParams;
  const tableNumber = parseInt(table ?? "1", 10);

  const restaurant = await getRestaurantBySlug(slug);
  if (!restaurant) notFound();

  return <OrderMenu restaurant={restaurant} tableNumber={tableNumber} />;
}
