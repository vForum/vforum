import { notFound } from "next/navigation";
import Feed from "@/components/Feed";
import { CATEGORIES, getCategory } from "@/lib/categories";

export const dynamicParams = false;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default function CategoryPage({ params }) {
  const category = getCategory(params.slug);
  if (!category) notFound();
  return <Feed category={category} />;
}
