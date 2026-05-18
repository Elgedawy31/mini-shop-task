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
export {
  useAuth,
  useLogin,
  useRegister,
  useSetupStatus,
  useSetupAdmin,
  authUtils,
} from "./hooks/useAuth";

// Auth Types
export type {
  LoginFormData,
  SetupAdminFormData,
  RegisterFormData,
  RegisterRequestData,
  AuthState,
  User,
  AuthAction,
} from "./types/AuthForm";

export { loginSchema, setupAdminSchema, registerSchema } from "./types/AuthForm";

export type {
  User as AuthServiceUser,
  LoginRequest,
  RegisterRequest,
  AuthResult,
  UpdateUserRequest,
  UpdateUserResponse,
} from "./services/authService";

// Auth Components
export { default as LoginPage } from "./pages/LoginPage";
export { default as LoginTemplate } from "./components/LoginTemplate";
export { default as LoginForm } from "./components/LoginForm";
export { default as SetupPage } from "./pages/SetupPage";
