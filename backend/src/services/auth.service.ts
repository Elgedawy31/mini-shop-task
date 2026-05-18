import { AppError } from "../errors/app-error.js";
import { createAnonClient, createServiceClient, createUserClient } from "../lib/supabase.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  SetupAdminInput,
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

function mapRegistrationError(message: string): AppError {
  const lower = message.toLowerCase();

  if (lower.includes("rate limit")) {
    return new AppError({
      code: "registration_rate_limited",
      message: "Too many sign-up attempts. Please wait a few minutes and try again.",
      statusCode: 429,
    });
  }

  if (
    lower.includes("already registered") ||
    lower.includes("already been registered") ||
    lower.includes("already exists") ||
    lower.includes("duplicate") ||
    (lower.includes("already") && lower.includes("registered"))
  ) {
    return new AppError({
      code: "email_already_registered",
      message: "An account with this email already exists. Sign in with your password instead.",
      statusCode: 409,
    });
  }

  if (lower.includes("invalid") && lower.includes("email")) {
    return new AppError({
      code: "invalid_email",
      message:
        "This email could not be used. If you already registered, try signing in or use forgot password.",
      statusCode: 400,
    });
  }

  return new AppError({
    code: "registration_failed",
    message,
    statusCode: 400,
  });
}

async function findAuthUserByEmail(email: string) {
  const service = createServiceClient();
  const normalized = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await service.auth.admin.listUsers({ page, perPage: 200 });
    if (error) {
      throw new AppError({
        code: "registration_failed",
        message: error.message,
        statusCode: 500,
      });
    }

    const match = data.users.find((user) => user.email?.toLowerCase() === normalized);
    if (match) return match;

    if (data.users.length < 200) break;
  }

  return null;
}

/** Mobile-friendly registration: confirmed user + immediate session (no email confirmation step). */
export async function register(input: RegisterInput): Promise<AuthSessionPayload> {
  const service = createServiceClient();

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name },
  });

  if (createError) {
    const msg = createError.message ?? "Registration failed";
    const lower = msg.toLowerCase();

    if (lower.includes("already") && lower.includes("registered")) {
      try {
        return await login(input);
      } catch {
        const existing = await findAuthUserByEmail(input.email);

        // Finish accounts stuck from the old email-confirmation signup flow.
        if (existing && !existing.email_confirmed_at) {
          const { error: updateError } = await service.auth.admin.updateUserById(existing.id, {
            password: input.password,
            email_confirm: true,
            user_metadata: { name: input.name },
          });

          if (!updateError) {
            await service
              .from("profiles")
              .upsert(
                { id: existing.id, name: input.name, role: "customer" },
                { onConflict: "id" }
              );
            return login(input);
          }
        }

        throw new AppError({
          code: "email_already_registered",
          message:
            "This email is already registered. Sign in with your existing password, or use Forgot password.",
          statusCode: 409,
        });
      }
    }

    throw mapRegistrationError(msg);
  }

  if (!created.user) {
    throw new AppError({
      code: "registration_failed",
      message: "Could not create account",
      statusCode: 400,
    });
  }

  const { error: profileError } = await service.from("profiles").upsert(
    {
      id: created.user.id,
      name: input.name,
      role: "customer",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new AppError({
      code: "registration_failed",
      message: profileError.message,
      statusCode: 500,
    });
  }

  return login({ email: input.email, password: input.password });
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

async function countAdminProfiles(): Promise<number> {
  const supabase = createServiceClient();
  const { count, error } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (error) {
    throw new AppError({
      code: "setup_status_failed",
      message: error.message,
      statusCode: 500,
    });
  }

  return count ?? 0;
}

export async function getSetupStatus(): Promise<{ needsSetup: boolean }> {
  const adminCount = await countAdminProfiles();
  return { needsSetup: adminCount === 0 };
}

export async function setupFirstAdmin(input: SetupAdminInput): Promise<AuthSessionPayload> {
  const adminCount = await countAdminProfiles();

  if (adminCount > 0) {
    throw new AppError({
      code: "setup_not_allowed",
      message: "An admin account already exists. Sign in instead.",
      statusCode: 403,
    });
  }

  const service = createServiceClient();

  const { data: created, error: createError } = await service.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { name: input.name },
  });

  if (createError || !created.user) {
    throw new AppError({
      code: "setup_failed",
      message: createError?.message ?? "Could not create admin account",
      statusCode: 400,
    });
  }

  const { error: profileError } = await service.from("profiles").upsert(
    {
      id: created.user.id,
      name: input.name,
      role: "admin",
    },
    { onConflict: "id" }
  );

  if (profileError) {
    throw new AppError({
      code: "setup_failed",
      message: profileError.message,
      statusCode: 500,
    });
  }

  return login({ email: input.email, password: input.password });
}

export async function refreshSession(input: RefreshTokenInput): Promise<AuthSessionPayload> {
  const supabase = createAnonClient();

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: input.refreshToken,
  });

  if (error || !data.session || !data.user) {
    throw new AppError({
      code: "invalid_refresh_token",
      message: "Session expired. Please sign in again.",
      statusCode: 401,
    });
  }

  const user = await loadProfile(data.user.id, data.user.email ?? "");

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

  const { data: authData, error: authUserError } = await supabase.auth.getUser(accessToken);
  if (authUserError || !authData.user) {
    throw new AppError({
      code: "unauthorized",
      message: authUserError?.message ?? "Not authenticated",
      statusCode: 401,
    });
  }

  const userId = authData.user.id;

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
    const { error } = await supabase.from("profiles").update({ name: input.name }).eq("id", userId);

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
