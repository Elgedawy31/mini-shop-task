import { AppError } from "../errors/app-error.js";
import { createAnonClient } from "../lib/supabase.js";

export async function listCategories() {
  const client = createAnonClient();

  const { data, error } = await client
    .from("categories")
    .select("id, name, slug, created_at")
    .order("name", { ascending: true });

  if (error) {
    throw new AppError({
      code: "categories_list_failed",
      message: error.message,
      statusCode: 500,
    });
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    createdAt: row.created_at,
  }));
}
