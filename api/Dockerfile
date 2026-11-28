FROM node:24-bookworm-slim AS dependencies
WORKDIR /app

COPY package.json package-lock.json ./
COPY web/package.json ./web/
COPY api/package.json ./api/

FROM dependencies AS build
RUN npm ci --workspace api
COPY api/nest-cli.json api/tsconfig.json ./api/
COPY api/src ./api/src
RUN npm run build --workspace api

FROM dependencies AS runtime
ENV NODE_ENV=production
RUN npm ci --omit=dev --workspace api
COPY --from=build /app/api/dist ./api/dist
USER node
EXPOSE 3000
CMD ["node", "api/dist/main.js"]
