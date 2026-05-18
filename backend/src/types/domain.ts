export type UserRole = "customer" | "admin";

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type ProfileRow = {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type ProductRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string | null;
  category_id: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type OrderRow = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
};
