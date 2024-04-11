# syntax=docker/dockerfile:1.5
FROM node:19.4-bullseye AS build

WORKDIR /usr/src/app

# Copy only files required to install
# dependencies (better layer caching)

COPY ../package*.json ./
COPY ./src .

RUN npm run build
# Use separate stage for deployable image
FROM nginxinc/nginx-unprivileged:1.23-alpine-perl

# Use COPY --link to avoid breaking cache if we change the second stage base image
COPY --link nginx.conf /etc/nginx/conf.d/default.conf

COPY --link --from=build usr/src/app/dist/ /usr/share/nginx/html





ENV NODE_ENV=production
ENV VITE_APP_API_URL  https://aptrsapi.souravkalal.tech/api/

EXPOSE 8080
USER node
COPY --chown=node:node ./src .

# CMD ["npm", "run", "dev"] 