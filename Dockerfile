# Raksha — production image (Google Cloud Run / any Docker host)
# Single process: Next.js + WebSocket + the Moss runtime, all in one Node server.
FROM node:22-bookworm-slim AS base
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=7860 \
    HOSTNAME=0.0.0.0 \
    MOSS_MODEL_CACHE_DIR=/data/moss-models \
    MOSS_CACHE_PATH=/data/moss-cache \
    MOSS_EMBEDDING_INTRA_OP_THREADS=2
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --include=dev --no-audit --no-fund

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS runtime
# Run as the unprivileged `node` user (uid 1000) that ships with the base image;
# /data holds the Moss model + index caches and must be writable by it.
RUN mkdir -p /data && chown -R node:node /data /app
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/.next ./.next
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/data ./data
COPY --from=build --chown=node:node /app/docs/eval ./docs/eval
COPY --from=build --chown=node:node /app/next.config.ts ./next.config.ts
USER node
EXPOSE 7860
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s CMD node -e "fetch('http://localhost:'+process.env.PORT+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server.mjs"]
