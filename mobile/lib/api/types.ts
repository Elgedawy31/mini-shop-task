export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; message: string; error?: string; statusCode?: number; errors?: string[] };

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "customer";
};

export type AuthSessionPayload = {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user: AuthUser;
};
