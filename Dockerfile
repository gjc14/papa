FROM node:20-alpine AS development-dependencies-env
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY . /app
WORKDIR /app
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS production-dependencies-env
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ./package.json pnpm-lock.yaml /app/
WORKDIR /app
RUN pnpm install --frozen-lockfile --prod

FROM node:20-alpine AS build-env
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
ARG VITE_BASE_URL
ENV VITE_BASE_URL=$VITE_BASE_URL
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN pnpm run build

FROM node:20-alpine
# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY ./package.json pnpm-lock.yaml /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
CMD ["pnpm", "run", "start"]