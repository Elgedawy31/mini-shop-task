import { AppError } from "../errors/app-error.js";
import { createAnonClient, createServiceClient, createUserClient } from "../lib/supabase.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  UpdateProfileInput,
} from "../schemas/auth.schema.js";
import type { AuthUser } from "../types/domain.js";

type AuthSessionPayload = {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user: AuthUser;
};

async function loadProfile(userId: string, email: string): Promise<AuthUser> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new AppError({
      code: "profile_not_found",
      message: "User profile not found",
      statusCode: 500,
    });
  }

  return {
    id: userId,
    email,
    name: data.name,
    role: data.role,
  };
}

function mapSession(
  accessToken: string,
  refreshToken: string | undefined,
  expiresIn: number | undefined,
  user: AuthUser
): AuthSessionPayload {
  return {
    token: accessToken,
    refreshToken,
    expiresIn,
    user,
  };
}

export async function register(input: RegisterInput): Promise<AuthSessionPayload> {
  const supabase = createAnonClient();

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: { name: input.name },
    },
  });

  if (error) {
    throw new AppError({
      code: "registration_failed",
      message: error.message,
      statusCode: 400,
    });
  }

  if (!data.user || !data.session) {
    throw new AppError({
      code: "registration_failed",
      message: "Registration requires email confirmation or could not create session",
      statusCode: 400,
    });
  }

  const service = createServiceClient();
  await service
    .from("profiles")
    .upsert({ id: data.user.id, name: input.name, role: "customer" }, { onConflict: "id" });

  const user = await loadProfile(data.user.id, data.user.email ?? input.email);

  return mapSession(
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in,
    user
  );
}

export async function login(input: LoginInput): Promise<AuthSessionPayload> {
  const supabase = createAnonClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session || !data.user) {
    throw new AppError({
      code: "invalid_credentials",
      message: "Invalid email or password",
      statusCode: 401,
    });
  }

  const user = await loadProfile(data.user.id, data.user.email ?? input.email);

  return mapSession(
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in,
    user
  );
}

export async function forgotPassword(input: ForgotPasswordInput): Promise<void> {
  const supabase = createAnonClient();
  const { error } = await supabase.auth.resetPasswordForEmail(input.email);

  if (error) {
    throw new AppError({
      code: "password_reset_failed",
      message: error.message,
      statusCode: 400,
    });
  }
}

export async function getMe(accessToken: string): Promise<AuthUser> {
  return resolveUser(accessToken);
}

export async function updateMe(accessToken: string, input: UpdateProfileInput): Promise<AuthUser> {
  const supabase = createUserClient(accessToken);

  if (input.email || input.password) {
    const { error: authError } = await supabase.auth.updateUser({
      email: input.email,
      password: input.password,
    });

    if (authError) {
      throw new AppError({
        code: "profile_update_failed",
        message: authError.message,
        statusCode: 400,
      });
    }
  }

  if (input.name) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) {
      throw new AppError({ code: "unauthorized", message: "Not authenticated", statusCode: 401 });
    }

    const { error } = await supabase
      .from("profiles")
      .update({ name: input.name })
      .eq("id", authData.user.id);

    if (error) {
      throw new AppError({
        code: "profile_update_failed",
        message: error.message,
        statusCode: 400,
      });
    }
  }

  return getMe(accessToken);
}

async function resolveUser(accessToken: string): Promise<AuthUser> {
  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.getUser(accessToken);

  if (error || !data.user) {
    throw new AppError({
      code: "unauthorized",
      message: "Invalid or expired token",
      statusCode: 401,
    });
  }

  return loadProfile(data.user.id, data.user.email ?? "");
}
