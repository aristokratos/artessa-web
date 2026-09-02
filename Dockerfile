# syntax=docker/dockerfile:1
#
# Build context is this directory:
#   docker build -t artessa-web .

FROM node:24-alpine AS deps
WORKDIR /app
# Copy only the manifests so the install layer is cached across source changes.
COPY package.json package-lock.json* ./
RUN npm ci

FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NEXT_PUBLIC_* values are inlined at build time, not read at runtime — they
# have to be present here, and they are public by definition. Render supplies
# them as build-time env vars.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1

# `output: "standalone"` traces only the files actually imported, so the image
# carries a minimal node_modules rather than the whole install.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

# node:alpine ships a non-root `node` user (UID 1000).
USER node

# Managed platforms inject the port via $PORT and health-check exactly that
# port; a hardcoded port makes the container look dead.
EXPOSE 3000
ENV HOSTNAME=0.0.0.0
CMD ["sh", "-c", "PORT=${PORT:-3000} node server.js"]
