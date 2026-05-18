export type Pagination = { page: number; limit: number; total: number };

export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type ProductCategory = { id: string; name: string; slug: string };

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  categoryId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: ProductCategory | null;
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  productImageUrl: string | null;
  quantity: number;
  unitPrice: number;
};

export type Order = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
};
