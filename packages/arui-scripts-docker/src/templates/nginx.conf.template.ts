import { type ResolvedDockerConfig } from '../types';

/**
 * server-блок nginx-конфига, который раздает статику и (в не-clientOnly режиме) проксирует на nodejs.
 */
export function renderNginxConf(config: ResolvedDockerConfig): string {
    const {
        clientServerPort,
        enablePreviousVersionHeaders,
        clientOnly,
        nginxRootPath,
        buildPath,
        serverPort,
        publicPath,
    } = config;

    return `client_max_body_size 20m;

server {
    listen ${clientServerPort};
    server_tokens off;
    ${enablePreviousVersionHeaders ? 'brotli_auto_dictionary on;' : ''}

    ${
        clientOnly
            ? `location / {
        root ${nginxRootPath}/${buildPath};
        index index.html;
        }`
            : ` location / {
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:${serverPort};
    }`
    }

    location /${publicPath} {
        expires max;
        add_header Cache-Control public;
        root ${nginxRootPath}/${buildPath};
    }

    location = /${publicPath}remoteEntry.js {
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";
        add_header Pragma "no-cache";
        add_header Expires "0";
        root ${nginxRootPath}/${buildPath};
        types {
            text/javascript  js;
        }
    }

    location ~ /${publicPath}.*\\.js$ {
        expires max;
        add_header Cache-Control public;
        root ${nginxRootPath}/${buildPath};
        types {
            text/javascript  js;
        }
    }
}`;
}
