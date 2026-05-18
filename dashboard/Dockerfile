FROM oven/bun:1.2.18 AS base
WORKDIR /app
ENV HUSKY=0

FROM base AS development
COPY package.json bun.lock ./
COPY dashboard/package.json ./dashboard/package.json
COPY backend/package.json ./backend/package.json
RUN bun install --frozen-lockfile
COPY dashboard ./dashboard
WORKDIR /app/dashboard
EXPOSE 5000
CMD ["bun", "dev", "--host", "0.0.0.0"]

FROM base AS build
ARG VITE_API_BASE_URL=/
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json bun.lock ./
COPY dashboard/package.json ./dashboard/package.json
COPY backend/package.json ./backend/package.json
RUN bun install --frozen-lockfile
COPY dashboard ./dashboard
WORKDIR /app/dashboard
RUN bun run build

FROM nginx:1.27-alpine AS production
COPY --from=build /app/dashboard/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
