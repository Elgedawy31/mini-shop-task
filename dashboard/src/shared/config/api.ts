// API Configuration - Centralized configuration for all API integrations
export const API_CONFIG = {
  // Base configuration
  BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001",
  TIMEOUT: 30000, // 30 seconds

  // Authentication
  AUTH_TOKEN_KEY: "token",

  // Endpoints
  ENDPOINTS: {
    // Authentication endpoints
    AUTH: {
      LOGIN: "/api/users/login",
      REGISTER: "/api/users",
    },

    // File upload endpoints
    FILES: {
      BULK_UPLOAD: "/api/files/bulk",
      REPLACE_FILE: (fileName: string) => `/api/files/${fileName}`,
    },

    // Product endpoints
    PRODUCTS: {
      CREATE: "/api/products",
      LIST: "/api/products",
      GET: (id: string) => `/api/products/${id}`,
      UPDATE: (id: string) => `/api/products/${id}`,
      DELETE: (id: string) => `/api/products/${id}`,
    },
    // Platform endpoints
    PLATFORMS: {
      CREATE: "/api/websites",
      LIST: "/api/websites",
      GET: (id: string) => `/api/websites/${id}`,
      UPDATE: (id: string) => `/api/websites/${id}`,
      DELETE: (id: string) => `/api/websites/${id}`,
    },
    // Category endpoints
    CATEGORIES: {
      CREATE: "/api/categories",
      LIST: "/api/categories",
      GET: (id: string) => `/api/categories/${id}`,
      UPDATE: (id: string) => `/api/categories/${id}`,
      DELETE: (id: string) => `/api/categories/${id}`,
    },
    // Listing endpoints
    LISTINGS: {
      CREATE: "/api/listings",
      LIST: "/api/listings",
      GET: (id: string) => `/api/listings/${id}`,
      UPDATE: (id: string) => `/api/listings/${id}`,
      DELETE: (id: string) => `/api/listings/${id}`,
    },
    // User endpoints
    USERS: {
      VERIFY: "/api/users/verify",
      PROFILE: "/api/users/profile",
      UPDATE: () => `/api/users`,
      LIST: "/api/users",
    },

    // Dashboard endpoints (for future use)
    DASHBOARD: {
      STATS: "/api/dashboard/stats",
    },
  },

  // File upload configuration
  UPLOAD: {
    MAX_FILE_SIZE: 1 * 1024 * 1024, // 1MB
    MAX_FILES: 10,
    ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
    ALLOWED_EXTENSIONS: [".jpeg", ".jpg", ".png", ".webp"],
  },

  // Request configuration
  HEADERS: {
    DEFAULT: {
      "Content-Type": "application/json",
    },
    MULTIPART: {
      "Content-Type": "multipart/form-data",
    },
  },
} as const;

// Environment-specific overrides
if (import.meta.env.PROD) {
  // Production-specific configurations
  // API_CONFIG.BASE_URL = 'https://api.yourproductiondomain.com'
}

export type ApiEndpoints = typeof API_CONFIG.ENDPOINTS;
export type UploadConfig = typeof API_CONFIG.UPLOAD;
