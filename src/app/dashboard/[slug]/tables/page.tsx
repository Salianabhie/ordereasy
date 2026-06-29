import { TablesManager } from "@/components/dashboard/tables-manager";
import { getTables } from "@/lib/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function TablesPage({ params }: PageProps) {
  const { slug } = await params;
  const tables = await getTables(slug);
  if (!tables) notFound();
  return <TablesManager slug={slug} tables={tables} />;
}
