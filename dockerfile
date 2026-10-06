# 1. Base Image
FROM node:22-alpine AS base

# Install FFmpeg natively into the container
RUN apk add --no-cache ffmpeg

# 2. Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 3. Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 4. Runner
FROM base AS runner
WORKDIR /app

ARG NEXT_PUBLIC_BACKEND_API_URL
ARG NEXT_PUBLIC_SESSION_EXPIRY_SECONDS
ARG NEXT_PUBLIC_OTP_EXPIRY_SECONDS
ARG NEXT_PUBLIC_GET_DSPS_URL
ARG NEXT_PUBLIC_GET_DSPS_BASIC_AUTH_PASSWORD
ARG NEXT_PUBLIC_GOOGLE_CLIENT_ID
ARG NEXT_PUBLIC_GOOGLE_CLIENT_SECRET


ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
