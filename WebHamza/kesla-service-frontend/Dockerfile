
FROM node:16.13.2 as build

WORKDIR /usr/local/app

COPY ./ /usr/local/app/

RUN npm install

RUN npm run build

FROM nginx:latest

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /usr/local/app/dist /usr/share/nginx/html

EXPOSE 80