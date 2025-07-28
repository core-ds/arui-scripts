import { configs } from '../configs/app-configs';
import { applyOverrides } from '../configs/util/apply-overrides';

const baseNginxConfig = {
    workerProcesses: 2,
    workerRlimitNoFile: 20000,
    workerConnections: 19000,
    eventsUse: 'epoll',
    daemon: 'off',
};
const nginx = {
    ...baseNginxConfig,
    ...configs.nginx,
};

const baseNginxTemplate = `
worker_processes            ${nginx.workerProcesses};
worker_rlimit_nofile        ${nginx.workerRlimitNoFile};
daemon                      ${nginx.daemon};

error_log                   /var/log/nginx/error.log;
pid                         /var/run/nginx.pid;

events {
    worker_connections      ${nginx.workerConnections};
    use                     ${nginx.eventsUse};
}

http {
    include                 /etc/nginx/mime.types;
    default_type            application/octet-stream;

    server_tokens off;
    access_log              off;
    keepalive_timeout       65;
    proxy_read_timeout      200;
    sendfile                on;
    tcp_nopush              on;
    tcp_nodelay             on;

    gzip_static             on;
    brotli                  on;
    brotli_static           on;
    brotli_types            application/atom+xml application/javascript application/json application/rss+xml
                            application/vnd.ms-fontobject application/x-font-opentype application/x-font-truetype
                            application/x-font-ttf application/x-javascript application/xhtml+xml application/xml
                            font/eot font/opentype font/otf font/truetype image/svg+xml image/vnd.microsoft.icon
                            image/x-icon image/x-win-bitmap text/css text/javascript text/plain text/xml application/wasm;


    # Only retry if there was a communication error, not a timeout
    # on the Node server (to avoid propagating "queries of death"
    # to all frontends)
    proxy_next_upstream     error;

    #cache
    proxy_cache_path        /var/cache/nginx levels=1:2 keys_zone=all:32m max_size=1g;

    include                 /etc/nginx/conf.d/*.conf;
}`;

export const nginxBaseConfTemplate = applyOverrides('nginxConf', baseNginxTemplate);
