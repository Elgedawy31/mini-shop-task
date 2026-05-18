// API Configuration — aligned with Mini Shop backend contract
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  TIMEOUT: 30_000,

  AUTH_TOKEN_KEY: "token",

  ENDPOINTS: {
    AUTH: {
      LOGIN: "/auth/login",
      REGISTER: "/auth/register",
      FORGOT_PASSWORD: "/auth/forgot-password",
      ME: "/auth/me",
      SETUP_STATUS: "/auth/setup/status",
      SETUP: "/auth/setup",
      REFRESH: "/auth/refresh",
    },

    PRODUCTS: {
      CREATE: "/products",
      LIST: "/products",
      GET: (id: string) => `/products/${id}`,
      UPDATE: (id: string) => `/products/${id}`,
      DELETE: (id: string) => `/products/${id}`,
      UPLOAD_IMAGE: "/products/upload-image",
    },

    ORDERS: {
      CREATE: "/orders",
      MY: "/orders/my",
      LIST: "/orders",
      GET: (id: string) => `/orders/${id}`,
      UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    },

    CATEGORIES: {
      LIST: "/categories",
    },

    DASHBOARD: {
      STATS: "/dashboard/stats",
      OVERVIEW: "/dashboard/overview",
      REVENUE_SERIES: "/dashboard/revenue-series",
      ORDERS_SERIES: "/dashboard/orders-series",
    },

    /** Legacy file routes — wire when storage is implemented */
    FILES: {
      BULK_UPLOAD: "/files/bulk",
      REPLACE_FILE: (fileName: string) => `/files/${fileName}`,
    },
  },

  UPLOAD: {
    MAX_FILE_SIZE: 1 * 1024 * 1024,
    MAX_FILES: 10,
    ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    ALLOWED_EXTENSIONS: [".jpeg", ".jpg", ".png", ".webp"],
  },

  HEADERS: {
    DEFAULT: {
      "Content-Type": "application/json",
    },
    MULTIPART: {
      "Content-Type": "multipart/form-data",
    },
  },
} as const;

export type ApiEndpoints = typeof API_CONFIG.ENDPOINTS;
export type UploadConfig = typeof API_CONFIG.UPLOAD;
