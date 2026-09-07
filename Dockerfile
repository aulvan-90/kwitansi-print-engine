# ==============================================================================
# Dockerfile - Kwitansi Generator & Precision Print Engine
# Lightweight Production Build with Nginx Alpine
# ==============================================================================

FROM nginx:alpine

LABEL maintainer="Aulvan Server Admin <admin@aulvan.com>"
LABEL description="Kwitansi Generator & Precision Print Engine for kwitansi.aulvan.com"

# Hapus file default nginx
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Salin konfigurasi Nginx container
COPY nginx-container.conf /etc/nginx/conf.d/default.conf

# Salin aset aplikasi statis
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY img/ /usr/share/nginx/html/img/

# Port standar Nginx
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
