FROM node:20-alpine3.19 as build

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

RUN pnpm run build

FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]