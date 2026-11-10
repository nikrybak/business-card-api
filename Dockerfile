FROM node:22-slim AS base
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json yarn.lock .yarnrc.yml prisma.config.ts ./
COPY .yarn/releases ./.yarn/releases
COPY prisma ./prisma

FROM base AS build
RUN yarn install --immutable
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN yarn build

FROM base AS runtime-deps
RUN yarn workspaces focus --production

FROM node:22-slim
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
COPY --from=runtime-deps /app ./
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
# Migrate, seed, serve: the container answers from an empty database
CMD ["yarn", "start:prod"]
