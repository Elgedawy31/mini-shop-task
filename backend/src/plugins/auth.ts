import type { FastifyInstance, FastifyRequest } from "fastify";
import { AppError } from "../errors/app-error.js";
import { createAnonClient, createUserClient } from "../lib/supabase.js";
import type { AuthUser, UserRole } from "../types/domain.js";

function extractBearerToken(request: FastifyRequest): string | null {
  const header = request.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7).trim() || null;
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

  const userClient = createUserClient(accessToken);
  const { data: profile, error: profileError } = await userClient
    .from("profiles")
    .select("id, name, role")
    .eq("id", data.user.id)
    .single();

  if (profileError || !profile) {
    throw new AppError({
      code: "unauthorized",
      message: "User profile not found",
      statusCode: 401,
    });
  }

  return {
    id: data.user.id,
    email: data.user.email ?? "",
    name: profile.name,
    role: profile.role as UserRole,
  };
}

export async function authenticate(request: FastifyRequest) {
  const token = extractBearerToken(request);
  if (!token) {
    throw new AppError({
      code: "unauthorized",
      message: "Authentication required",
      statusCode: 401,
    });
  }

  request.accessToken = token;
  request.user = await resolveUser(token);
}

export function optionalAuthenticate(app: FastifyInstance) {
  app.decorateRequest("user", undefined);
  app.decorateRequest("accessToken", undefined);
}

export function requireRole(...roles: UserRole[]) {
  return async (request: FastifyRequest) => {
    if (!request.user) {
      throw new AppError({
        code: "unauthorized",
        message: "Authentication required",
        statusCode: 401,
      });
    }

    if (!roles.includes(request.user.role)) {
      throw new AppError({
        code: "forbidden",
        message: "You do not have permission to perform this action",
        statusCode: 403,
      });
    }
  };
}

export function registerAuthPlugin(app: FastifyInstance) {
  optionalAuthenticate(app);
}
