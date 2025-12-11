FROM registry.cn-hangzhou.aliyuncs.com/gpg_dev/caddy:latest
LABEL authors="gaopuguang"
COPY ./dist /var/www/html
COPY ./Caddyfile /etc/caddy
ENV PORT=3001
ENV PREFIX_PATH="/api"
ENV PROXY="cloud-server.gpg123.vip:9099"
EXPOSE 3001
