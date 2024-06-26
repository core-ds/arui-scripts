import { configs } from '../configs/app-configs';
import applyOverrides from '../configs/util/apply-overrides';

const nginxTemplate = `client_max_body_size 20m;

server {
    listen ${configs.clientServerPort};
    server_tokens off;

    ${configs.clientOnly
        ? `location / {
        root ${configs.nginxRootPath}/${configs.buildPath};
        index index.html;
        }`
        : ` location / {
        proxy_set_header Host $host;
        proxy_pass http://127.0.0.1:${configs.serverPort};
    }`}

    location /${configs.publicPath} {
        expires max;
        add_header Cache-Control public;
        root ${configs.nginxRootPath}/${configs.buildPath};
    }

    location ~ /${configs.publicPath}.*\\.js$ {
        expires max;
        add_header Cache-Control public;
        root ${configs.nginxRootPath}/${configs.buildPath};
        types {
            text/javascript  js;
        }
    }
}`;

export default applyOverrides('nginx', nginxTemplate);
