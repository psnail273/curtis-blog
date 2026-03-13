# Base image with Node.js 20
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build arguments for Next.js public env vars (baked into client bundle at build time)
ARG NEXT_PUBLIC_TWITCH_USERNAME
ARG NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
ARG NEXT_PUBLIC_YOUTUBE_HANDLE
ENV NEXT_PUBLIC_TWITCH_USERNAME=$NEXT_PUBLIC_TWITCH_USERNAME
ENV NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=$NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
ENV NEXT_PUBLIC_YOUTUBE_HANDLE=$NEXT_PUBLIC_YOUTUBE_HANDLE

# Build the application using secret mounts (secrets are not persisted in image)
ENV NEXT_TELEMETRY_DISABLED=1
RUN --mount=type=secret,id=DATABASE_URL \
    --mount=type=secret,id=AUTH_SECRET \
    --mount=type=secret,id=ADMIN_PASSWORD \
    --mount=type=secret,id=GOOGLE_CLIENT_ID \
    --mount=type=secret,id=GOOGLE_CLIENT_SECRET \
    --mount=type=secret,id=TWITCH_CLIENT_ID \
    --mount=type=secret,id=TWITCH_CLIENT_SECRET \
    --mount=type=secret,id=YOUTUBE_API_KEY \
    --mount=type=secret,id=CLOUDINARY_CLOUD_NAME \
    --mount=type=secret,id=CLOUDINARY_API_KEY \
    --mount=type=secret,id=CLOUDINARY_API_SECRET \
    --mount=type=secret,id=CLOUDINARY_FOLDER \
    DATABASE_URL=$(cat /run/secrets/DATABASE_URL) \
    AUTH_SECRET=$(cat /run/secrets/AUTH_SECRET) \
    ADMIN_PASSWORD=$(cat /run/secrets/ADMIN_PASSWORD) \
    GOOGLE_CLIENT_ID=$(cat /run/secrets/GOOGLE_CLIENT_ID) \
    GOOGLE_CLIENT_SECRET=$(cat /run/secrets/GOOGLE_CLIENT_SECRET) \
    TWITCH_CLIENT_ID=$(cat /run/secrets/TWITCH_CLIENT_ID) \
    TWITCH_CLIENT_SECRET=$(cat /run/secrets/TWITCH_CLIENT_SECRET) \
    YOUTUBE_API_KEY=$(cat /run/secrets/YOUTUBE_API_KEY) \
    CLOUDINARY_CLOUD_NAME=$(cat /run/secrets/CLOUDINARY_CLOUD_NAME) \
    CLOUDINARY_API_KEY=$(cat /run/secrets/CLOUDINARY_API_KEY) \
    CLOUDINARY_API_SECRET=$(cat /run/secrets/CLOUDINARY_API_SECRET) \
    CLOUDINARY_FOLDER=$(cat /run/secrets/CLOUDINARY_FOLDER) \
    npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Re-declare public env vars so they're available to server components at runtime
ARG NEXT_PUBLIC_TWITCH_USERNAME
ARG NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
ARG NEXT_PUBLIC_YOUTUBE_HANDLE
ENV NEXT_PUBLIC_TWITCH_USERNAME=$NEXT_PUBLIC_TWITCH_USERNAME
ENV NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=$NEXT_PUBLIC_YOUTUBE_CHANNEL_ID
ENV NEXT_PUBLIC_YOUTUBE_HANDLE=$NEXT_PUBLIC_YOUTUBE_HANDLE

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
