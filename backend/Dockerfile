FROM oven/bun:1.1 AS base
WORKDIR /app

FROM base AS development
COPY package.json ./
RUN bun install
COPY . .
EXPOSE 4000
CMD ["bun", "dev"]

FROM base AS build
COPY package.json tsconfig.json ./
RUN bun install
COPY src ./src
RUN bun run build

FROM oven/bun:1.1-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["bun", "dist/server.js"]
