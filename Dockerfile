FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG BUILD_CONFIGURATION=staging
RUN npm run build -- --configuration $BUILD_CONFIGURATION

FROM nginx:1.27-alpine

# Release tag (e.g. v2.26.0) passed by cd-release.yml; docker/write-config.sh writes it into config.js.
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/write-config.sh /docker-entrypoint.d/40-write-config.sh

COPY --from=build /app/dist/blitzpay-admin-dashboard/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
