FROM caddy:2.8
LABEL authors="gaopuguang"
COPY ./dist /var/www/html
COPY ./Caddyfile /etc/caddy
ENV PORT=3001
ENV PREFIX_PATH="/api"
ENV PROXY="cloud-server.gpg123.vip:9099"
EXPOSE 3001
