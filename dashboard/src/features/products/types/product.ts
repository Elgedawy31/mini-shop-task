export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

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
  category?: Pick<Category, "id" | "name" | "slug"> | null;
};

export type ProductsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  includeInactive?: boolean;
};

export type ProductPayload = {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string | null;
  categoryId?: string | null;
  isActive?: boolean;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};
