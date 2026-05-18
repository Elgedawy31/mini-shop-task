FROM oven/bun:1.2.18 AS base
WORKDIR /app
ENV HUSKY=0

FROM base AS development
COPY package.json bun.lock ./
COPY dashboard/package.json ./dashboard/package.json
COPY backend/package.json ./backend/package.json
RUN bun install --frozen-lockfile
COPY backend ./backend
WORKDIR /app/backend
EXPOSE 4000
CMD ["bun", "dev"]

FROM base AS build
COPY package.json bun.lock ./
COPY dashboard/package.json ./dashboard/package.json
COPY backend/package.json ./backend/package.json
RUN bun install --frozen-lockfile
COPY backend ./backend
WORKDIR /app/backend
RUN bun run build

FROM oven/bun:1.2.18-slim AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json bun.lock ./
COPY dashboard/package.json ./dashboard/package.json
COPY backend/package.json ./backend/package.json
RUN bun install --production --frozen-lockfile --ignore-scripts
COPY --from=build /app/backend/dist ./backend/dist
WORKDIR /app/backend
EXPOSE 4000
CMD ["bun", "dist/server.js"]
