FROM node:24-bookworm-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
COPY api/package.json ./api/
COPY web/package.json ./web/
RUN npm ci --workspace web

COPY web/index.html web/tsconfig.json web/vite.config.ts ./web/
COPY web/public ./web/public
COPY web/src ./web/src
RUN npm run build --workspace web

FROM nginx:stable-alpine
COPY web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/web/dist /usr/share/nginx/html
