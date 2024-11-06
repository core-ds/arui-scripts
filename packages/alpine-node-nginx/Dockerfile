ARG NODE_VERSION=latest
ARG ALPINE_VERSION=3.14
ARG NODE_BASE_IMAGE=node
ARG WORKERS=auto

# Copied from https://github.com/fholzer/docker-nginx-brotli/blob/master/Dockerfile
# this is a build container, target one is in the end

FROM alpine:${ALPINE_VERSION}
ENV NGINX_VERSION 1.27.1
ENV NGX_BROTLI_COMMIT 6e975bcb015f62e1f303054897783355e2a877dc
ENV NGNIX_CONFIG "\
    		--prefix=/etc/nginx \
    		--sbin-path=/usr/sbin/nginx \
    		--modules-path=/usr/lib/nginx/modules \
    		--conf-path=/etc/nginx/nginx.conf \
    		--error-log-path=/var/log/nginx/error.log \
    		--http-log-path=/var/log/nginx/access.log \
    		--pid-path=/var/run/nginx.pid \
    		--lock-path=/var/run/nginx.lock \
    		--http-client-body-temp-path=/var/cache/nginx/client_temp \
    		--http-proxy-temp-path=/var/cache/nginx/proxy_temp \
    		--http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
    		--http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
    		--http-scgi-temp-path=/var/cache/nginx/scgi_temp \
    		--user=nginx \
    		--group=nginx \
    		--with-http_ssl_module \
    		--with-http_realip_module \
    		--with-http_addition_module \
    		--with-http_sub_module \
    		--with-http_gunzip_module \
    		--with-http_gzip_static_module \
    		--with-http_image_filter_module=dynamic \
    		--with-threads \
    		--with-stream \
    		--with-stream_ssl_module \
    		--with-stream_ssl_preread_module \
    		--with-stream_realip_module \
    		--with-http_slice_module \
    		--with-compat \
    		--with-file-aio \
    		--with-http_v2_module \
    		--add-module=/usr/src/ngx_brotli \
    	"

RUN \
	apk add --no-cache --virtual .build-deps \
		gcc \
		libc-dev \
		make \
		openssl-dev \
		pcre-dev \
		zlib-dev \
		linux-headers \
		curl \
		gnupg \
		libxslt-dev \
		gd-dev
RUN \
	 apk add --no-cache --virtual .brotli-build-deps \
		tar \
		autoconf \
		libtool \
		automake \
		git \
		g++ \
		cmake \
		bash

SHELL ["/bin/bash", "-x", "-c"]

COPY gpg/ /tmp/gpg

RUN \
	mkdir -p /usr/src/ngx_brotli \
	&& cd /usr/src/ngx_brotli \
	&& git init \
	&& git remote add origin https://github.com/google/ngx_brotli.git \
	&& git fetch --depth 1 origin $NGX_BROTLI_COMMIT \
	&& git checkout --recurse-submodules -q FETCH_HEAD \
	&& git submodule update --init --depth 1 \
	&& cd .. \
	&& curl -fSL https://nginx.org/download/nginx-$NGINX_VERSION.tar.gz -o nginx.tar.gz \
	&& curl -fSL https://nginx.org/download/nginx-$NGINX_VERSION.tar.gz.asc  -o nginx.tar.gz.asc \
        && sha512sum nginx.tar.gz nginx.tar.gz.asc \
	&& export GNUPGHOME="$(mktemp -d)" \
	&& gpg --import /tmp/gpg/* \
	&& gpg --batch --verify nginx.tar.gz.asc nginx.tar.gz \
	&& mkdir -p /usr/src \
	&& tar -zxC /usr/src -f nginx.tar.gz

RUN \
	cd /usr/src/nginx-$NGINX_VERSION \
	&& ./configure $NGNIX_CONFIG --with-debug \
	&& make -j$(getconf _NPROCESSORS_ONLN) \
	&& mv objs/nginx objs/nginx-debug \
	&& mv objs/ngx_http_image_filter_module.so objs/ngx_http_image_filter_module-debug.so \
	&& ./configure $NGNIX_CONFIG \
	&& make -j$(getconf _NPROCESSORS_ONLN)

RUN \
	cd /usr/src/nginx-$NGINX_VERSION \
	&& make install \
	&& rm -rf /etc/nginx/html/ \
	&& mkdir /etc/nginx/conf.d/ \
	&& mkdir -p /usr/share/nginx/html/ \
	&& install -m644 html/index.html /usr/share/nginx/html/ \
	&& install -m644 html/50x.html /usr/share/nginx/html/ \
	&& install -m755 objs/nginx-debug /usr/sbin/nginx-debug \
	&& install -m755 objs/ngx_http_image_filter_module-debug.so /usr/lib/nginx/modules/ngx_http_image_filter_module-debug.so \
	&& strip /usr/sbin/nginx* \
	&& strip /usr/lib/nginx/modules/*.so \
	&& apk add --no-cache --virtual .gettext gettext \
	&& scanelf --needed --nobanner /usr/sbin/nginx /usr/lib/nginx/modules/*.so /usr/bin/envsubst \
			| awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
			| sort -u \
			| xargs -r apk info --installed \
			| sort -u > /tmp/runDeps.txt

 ## end copy


FROM ${NODE_BASE_IMAGE}:${NODE_VERSION}-alpine${ALPINE_VERSION}

COPY --from=0 /tmp/runDeps.txt /tmp/runDeps.txt
COPY --from=0 /etc/nginx /etc/nginx
COPY --from=0 /usr/lib/nginx/modules/*.so /usr/lib/nginx/modules/
COPY --from=0 /usr/sbin/nginx /usr/sbin/nginx-debug /usr/sbin/
COPY --from=0 /usr/share/nginx/html/* /usr/share/nginx/html/
COPY --from=0 /usr/bin/envsubst /usr/local/bin/envsubst

RUN \
	addgroup -S nginx \
	&& adduser -D -S -h /var/cache/nginx -s /sbin/nologin -G nginx nginx \
	&& apk add --no-cache --virtual .nginx-rundeps tzdata $(cat /tmp/runDeps.txt) \
	&& rm /tmp/runDeps.txt \
	&& ln -s /usr/lib/nginx/modules /etc/nginx/modules \
	# forward request and error logs to docker log collector
	&& mkdir /var/log/nginx \
	&& touch /var/log/nginx/access.log /var/log/nginx/error.log \
	&& ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log \
    # update all packages to latest
    && apk update \
    && apk upgrade --no-cache

# Copy the template configuration file into the image
COPY nginx.template.conf /tmp/nginx.template.conf
# set worker_processes based on WORKERS value
RUN sed "s/{{WORKER_PROCESSES}}/${WORKERS}/g" /tmp/nginx.template.conf > /etc/nginx/nginx.conf; \
    rm -rf /tmp/nginx.template.conf;

EXPOSE 80 443

STOPSIGNAL SIGTERM

ADD nginx.conf /etc/nginx/
# End copy
