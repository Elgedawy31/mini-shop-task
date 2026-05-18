export { AuthService } from "./services/authService";
export {
  login,
  isAuthenticated,
  getAuthToken,
  setAuthToken,
  getUserData,
  setUserData,
  clearAuthData,
  validateLoginData,
  transformLoginFormData,
} from "./services/authService";

// Auth Hooks
export { useAuth, useLogin, useRegister, authUtils } from "./hooks/useAuth";

// Auth Types
export type {
  LoginFormData,
  RegisterFormData,
  RegisterRequestData,
  AuthState,
  User,
  AuthAction,
} from "./types/AuthForm";

export { loginSchema, registerSchema } from "./types/AuthForm";

export type {
  User as AuthUser,
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  RefreshTokenRequest,
  LogoutResponse,
} from "./services/authService";

// Auth Components
export { default as LoginPage } from "./pages/LoginPage";
export { default as LoginTemplate } from "./components/LoginTemplate";
export { default as LoginForm } from "./components/LoginForm";
