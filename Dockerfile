FROM nginx:alpine

LABEL org.opencontainers.image.title="Calendar Thirteen"
LABEL org.opencontainers.image.description="A symmetric calendar with thirteen 28-day months"
LABEL org.opencontainers.image.source="https://github.com/VRyzhkov/CalendarThirteen"

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/healthz || exit 1
