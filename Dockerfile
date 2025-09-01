
# ---- Base de build ----
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache libc6-compat

# Copiar archivos de manifiesto
COPY package.json package-lock.json* .npmrc* ./

# Instalar dependencias
RUN npm ci

# Copiar el resto del código
COPY . .

# Establecer variables de entorno para build (pueden ser sobreescritas en runtime)
ENV NEXT_TELEMETRY_DISABLED=1

# Build de producción (standalone)
RUN npm run build

# ---- Runtime ----
FROM node:18-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

# Copiar artefactos standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Crear directorio para datos persistentes (image-config)
RUN mkdir -p /app/.data && chown -R nextjs:nodejs /app
VOLUME ["/app/.data"]

# Exponer puerto
EXPOSE 3000

# Cambiar a usuario no-root
USER nextjs

# Comando de arranque
ENV PORT=3000
CMD ["node", "server.js"]
