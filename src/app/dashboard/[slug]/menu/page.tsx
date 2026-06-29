import { MenuManager } from "@/components/dashboard/menu-manager";
import { getMenuCategories } from "@/lib/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function MenuPage({ params }: PageProps) {
  const { slug } = await params;
  const categories = await getMenuCategories(slug);
  if (!categories) notFound();
  return <MenuManager slug={slug} categories={categories} />;
}
