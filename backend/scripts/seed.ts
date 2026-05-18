/**
 * Seed Mini Shop data. Requires SUPABASE_* env vars (service role).
 *
 * Usage: bun --cwd backend scripts/seed.ts
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Fashion", slug: "fashion" },
  { name: "Home", slug: "home" },
];

const products = [
  {
    name: "Wireless Earbuds",
    description: "Noise-cancelling Bluetooth earbuds",
    price: 79.99,
    categorySlug: "electronics",
  },
  {
    name: "Smart Watch",
    description: "Fitness tracking and notifications",
    price: 149.5,
    categorySlug: "electronics",
  },
  {
    name: "USB-C Hub",
    description: "7-in-1 adapter for laptops",
    price: 45.0,
    categorySlug: "electronics",
  },
  {
    name: "Classic Tee",
    description: "Organic cotton t-shirt",
    price: 24.99,
    categorySlug: "fashion",
  },
  {
    name: "Denim Jacket",
    description: "Lightweight denim jacket",
    price: 89.0,
    categorySlug: "fashion",
  },
  {
    name: "Running Shoes",
    description: "Breathable mesh running shoes",
    price: 110.0,
    categorySlug: "fashion",
  },
  {
    name: "Ceramic Mug Set",
    description: "Set of 4 stoneware mugs",
    price: 32.5,
    categorySlug: "home",
  },
  {
    name: "Desk Lamp",
    description: "Adjustable LED desk lamp",
    price: 38.0,
    categorySlug: "home",
  },
  {
    name: "Throw Blanket",
    description: "Soft fleece blanket",
    price: 29.99,
    categorySlug: "home",
  },
  {
    name: "Storage Baskets",
    description: "Woven storage basket trio",
    price: 42.0,
    categorySlug: "home",
  },
  {
    name: "Portable Speaker",
    description: "Water-resistant Bluetooth speaker",
    price: 59.99,
    categorySlug: "electronics",
  },
];

async function upsertUser(
  email: string,
  password: string,
  name: string,
  role: "customer" | "admin"
) {
  const { data: existing } = await supabase.auth.admin.listUsers();
  const found = existing.users.find((u) => u.email === email);

  let userId = found?.id;

  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (error) throw error;
    userId = data.user.id;
  }

  await supabase.from("profiles").upsert({ id: userId, name, role }, { onConflict: "id" });
  return userId;
}

async function main() {
  console.log("Seeding categories...");
  const { data: insertedCategories, error: catError } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select();

  if (catError) throw catError;

  const slugToId = Object.fromEntries((insertedCategories ?? []).map((c) => [c.slug, c.id]));

  console.log("Seeding products...");
  const productRows = products.map((p) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    category_id: slugToId[p.categorySlug],
    is_active: true,
    image_url: null,
  }));

  const { error: productError } = await supabase.from("products").insert(productRows);
  if (productError && !productError.message.includes("duplicate")) {
    console.warn("Products insert:", productError.message);
  }

  console.log("Creating test users...");
  await upsertUser("customer@minishop.test", "Customer123!", "Test Customer", "customer");
  await upsertUser("admin@minishop.test", "Admin12345!", "Test Admin", "admin");

  console.log("\nSeed complete.");
  console.log("Customer: customer@minishop.test / Customer123!");
  console.log("Admin:    admin@minishop.test / Admin12345!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
