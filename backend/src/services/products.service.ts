import { AppError } from "../errors/app-error.js";
import { createAnonClient, createUserClient } from "../lib/supabase.js";
import type {
  CreateProductInput,
  ProductListQuery,
  UpdateProductInput,
} from "../schemas/product.schema.js";
import type { ProductRow } from "../types/domain.js";
import { parsePagination } from "../utils/pagination.js";

function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    imageUrl: row.image_url,
    categoryId: row.category_id,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function getProductsClient(accessToken?: string) {
  return accessToken ? createUserClient(accessToken) : createAnonClient();
}

export async function listProducts(query: ProductListQuery, accessToken?: string) {
  const { page, limit, offset } = parsePagination(query.page, query.limit);
  const client = getProductsClient(accessToken);

  let categoryId: string | undefined;
  if (query.category) {
    const { data: category } = await client
      .from("categories")
      .select("id")
      .eq("slug", query.category)
      .maybeSingle();

    if (!category) {
      return { items: [], pagination: { page, limit, total: 0 } };
    }
    categoryId = category.id;
  }

  let dbQuery = client
    .from("products")
    .select("*, categories(id, name, slug)", { count: "exact" })
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (!query.includeInactive) {
    dbQuery = dbQuery.eq("is_active", true);
  }

  if (query.search) {
    dbQuery = dbQuery.or(`name.ilike.%${query.search}%,description.ilike.%${query.search}%`);
  }

  if (categoryId) {
    dbQuery = dbQuery.eq("category_id", categoryId);
  }

  const { data, error, count } = await dbQuery;

  if (error) {
    throw new AppError({
      code: "products_list_failed",
      message: error.message,
      statusCode: 500,
    });
  }

  return {
    items: (data ?? []).map((row) => ({
      ...mapProduct(row as ProductRow),
      category: row.categories ?? null,
    })),
    pagination: { page, limit, total: count ?? 0 },
  };
}

export async function getProductById(id: string, accessToken?: string) {
  const client = getProductsClient(accessToken);

  const { data, error } = await client
    .from("products")
    .select("*, categories(id, name, slug)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new AppError({ code: "product_fetch_failed", message: error.message, statusCode: 500 });
  }

  if (!data) {
    throw new AppError({ code: "not_found", message: "Product not found", statusCode: 404 });
  }

  if (!data.is_active) {
    throw new AppError({ code: "not_found", message: "Product not found", statusCode: 404 });
  }

  return {
    ...mapProduct(data as ProductRow),
    category: data.categories ?? null,
  };
}

export async function createProduct(accessToken: string, input: CreateProductInput) {
  const client = createUserClient(accessToken);

  const { data, error } = await client
    .from("products")
    .insert({
      name: input.name,
      description: input.description ?? "",
      price: input.price,
      category_id: input.categoryId ?? null,
      is_active: input.isActive ?? true,
      image_url: input.imageUrl ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new AppError({
      code: "product_create_failed",
      message: error.message,
      statusCode: 400,
    });
  }

  return mapProduct(data as ProductRow);
}

export async function updateProduct(accessToken: string, id: string, input: UpdateProductInput) {
  const client = createUserClient(accessToken);

  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.price !== undefined) payload.price = input.price;
  if (input.categoryId !== undefined) payload.category_id = input.categoryId;
  if (input.isActive !== undefined) payload.is_active = input.isActive;
  if (input.imageUrl !== undefined) payload.image_url = input.imageUrl;

  const { data, error } = await client
    .from("products")
    .update(payload)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    throw new AppError({
      code: "product_update_failed",
      message: error.message,
      statusCode: 400,
    });
  }

  if (!data) {
    throw new AppError({ code: "not_found", message: "Product not found", statusCode: 404 });
  }

  return mapProduct(data as ProductRow);
}

export async function deleteProduct(accessToken: string, id: string) {
  const client = createUserClient(accessToken);

  const { data, error } = await client
    .from("products")
    .update({ deleted_at: new Date().toISOString(), is_active: false })
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    throw new AppError({
      code: "product_delete_failed",
      message: error.message,
      statusCode: 400,
    });
  }

  if (!data) {
    throw new AppError({ code: "not_found", message: "Product not found", statusCode: 404 });
  }

  return { id, deleted: true };
}
