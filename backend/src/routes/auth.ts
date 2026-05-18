import type { FastifyInstance } from "fastify";
import { sendSuccess } from "../lib/api-response.js";
import { parseBody } from "../lib/validate.js";
import { authenticate } from "../plugins/auth.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  setupAdminSchema,
  updateProfileSchema,
} from "../schemas/auth.schema.js";
import * as authService from "../services/auth.service.js";

export async function authRoutes(app: FastifyInstance) {
  app.get("/auth/setup/status", async (_request, reply) => {
    const status = await authService.getSetupStatus();
    sendSuccess(reply, status);
  });

  app.post("/auth/setup", async (request, reply) => {
    const body = parseBody(setupAdminSchema, request.body);
    const session = await authService.setupFirstAdmin(body);
    sendSuccess(reply, session, {
      statusCode: 201,
      message: "Admin account created. Welcome to Mini Shop.",
    });
  });

  app.post("/auth/register", async (request, reply) => {
    const body = parseBody(registerSchema, request.body);
    const session = await authService.register(body);
    sendSuccess(reply, session, { statusCode: 201, message: "Registration successful" });
  });

  app.post("/auth/login", async (request, reply) => {
    const body = parseBody(loginSchema, request.body);
    const session = await authService.login(body);
    sendSuccess(reply, session, { message: "Login successful" });
  });

  app.post("/auth/forgot-password", async (request, reply) => {
    const body = parseBody(forgotPasswordSchema, request.body);
    await authService.forgotPassword(body);
    sendSuccess(reply, undefined, {
      message: "If an account exists, a password reset email has been sent",
    });
  });

  app.get("/auth/me", { preHandler: [authenticate] }, async (request, reply) => {
    const user = await authService.getMe(request.accessToken!);
    sendSuccess(reply, { user });
  });

  app.patch("/auth/me", { preHandler: [authenticate] }, async (request, reply) => {
    const body = parseBody(updateProfileSchema, request.body);
    const user = await authService.updateMe(request.accessToken!, body);
    sendSuccess(reply, { user }, { message: "Profile updated" });
  });
}
