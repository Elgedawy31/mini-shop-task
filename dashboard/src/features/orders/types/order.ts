export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";

export type OrderCustomer = {
  id: string;
  name: string;
};

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
  customer?: OrderCustomer;
  items?: OrderItem[];
};

export type OrdersQuery = {
  page?: number;
  limit?: number;
  status?: OrderStatus | "all";
};
