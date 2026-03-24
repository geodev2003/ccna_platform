FROM node:20-alpine AS builder
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN mkdir -p public
RUN if [ -d "/app/public" ] && [ "$(ls -A /app/public)" ]; then cp -r /app/public/* ./public/; fi
RUN chown -R app:app /app
USER app
EXPOSE 3000
CMD ["node", "server.js"]
