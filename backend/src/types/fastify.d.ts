import type { AuthUser } from "./domain.js";

declare module "fastify" {
  interface FastifyRequest {
    user?: AuthUser;
    accessToken?: string;
  }
}
