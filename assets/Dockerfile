# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================

# IMPORTANT: Node.js Version Maintenance
# This Dockerfile uses Node.js 24.13.0-slim, which was the latest LTS version at the time of writing.
# To ensure security and compatibility, regularly update the NODE_VERSION ARG to the latest LTS version.
ARG NODE_VERSION=24.13.0-slim
ARG PNPM_VERSION=11.22.0

FROM --platform=$BUILDPLATFORM node:${NODE_VERSION} AS pnpm-base

ARG PNPM_VERSION
RUN npm install --global pnpm@${PNPM_VERSION}

FROM pnpm-base AS dependencies

# Set working directory
WORKDIR /app

# Copy package-related files first to leverage Docker's caching mechanism
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install project dependencies with frozen lockfile for reproducible builds
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
  pnpm install --frozen-lockfile

# ============================================
# Stage 2: Build Next.js application in standalone mode
# ============================================

FROM pnpm-base AS builder

# Set working directory
WORKDIR /app

# Copy project dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy application source code
COPY . .

ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_HOST
ARG NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT
ARG NEXT_PUBLIC_CONTACT_FORM_ENDPOINT
ARG NEXT_PUBLIC_CAPTCHA_SITE_KEY
ARG NEXT_PUBLIC_DEPLOYMENT_ENV
ENV NEXT_PUBLIC_API_HOST=${NEXT_PUBLIC_API_HOST}
ENV NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT=${NEXT_PUBLIC_SUPPORT_TICKET_ENDPOINT}
ENV NEXT_PUBLIC_CONTACT_FORM_ENDPOINT=${NEXT_PUBLIC_CONTACT_FORM_ENDPOINT}
ENV NEXT_PUBLIC_CAPTCHA_SITE_KEY=${NEXT_PUBLIC_CAPTCHA_SITE_KEY}
ENV NEXT_PUBLIC_DEPLOYMENT_ENV=${NEXT_PUBLIC_DEPLOYMENT_ENV}

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the build.
# ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application. BuildKit persists the Next.js compiler cache via
# the workflow's existing GHA cache export; runtime fetch data is not copied.
RUN --mount=type=cache,target=/app/.next/cache \
  pnpm build

# ============================================
# Stage 3: Run Next.js application
# ============================================

FROM --platform=$TARGETPLATFORM node:${NODE_VERSION} AS runner
LABEL org.opencontainers.image.source="https://github.com/mjhale/formdelegate"

# Set working directory
WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js collects completely anonymous telemetry data about general usage.
# Learn more here: https://nextjs.org/telemetry
# Uncomment the following line in case you want to disable telemetry during the run time.
# ENV NEXT_TELEMETRY_DISABLED=1

# Copy production assets
COPY --from=builder --chown=node:node /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown node:node .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# If you want to persist the fetch cache generated during the build so that
# cached responses are available immediately on startup, uncomment this line:
# COPY --from=builder --chown=node:node /app/.next/cache ./.next/cache

# Switch to non-root user for security best practices
USER node

# Expose port 3000 to allow HTTP traffic
EXPOSE 3000

# Start Next.js standalone server
CMD ["node", "server.js"]
