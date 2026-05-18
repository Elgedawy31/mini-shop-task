/** Backend error contract (Mini Shop task) */
export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string;
};

/** Standard success envelope */
export type ApiSuccessBody<T = unknown> = {
  success: true;
  message?: string;
  data?: T;
};

/** Client-side normalized API response */
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  statusCode?: number;
};

/** Normalized error thrown by apiClient */
export type ApiClientError = {
  message: string;
  status?: number;
  error?: string;
  errors?: string[];
};

export type AuthTokens = {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
};

export type AuthUser = {
  id?: string;
  _id?: string;
  email: string;
  name?: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthPayload = AuthTokens & {
  user?: AuthUser;
};
