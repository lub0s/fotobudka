FROM node:18-alpine
FROM caddy:2.6

RUN apk update
RUN apk add --update npm

COPY ./config/Caddyfile /etc/caddy/Caddyfile

WORKDIR /home/node/public
COPY ./frontend/ /home/node/public

WORKDIR /home/node/public/
RUN npm install && npm run build
