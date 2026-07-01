import { type ResolvedDockerConfig } from '../types';

/**
 * Dockerfile для «сырого» образа: приложение собирается на хосте, в образ кладется результат сборки.
 */
export function renderDockerfile(config: ResolvedDockerConfig): string {
    const { clientOnly, buildPath, runFromNonRootUser, baseDockerImage, nginx } = config;

    const appPathToAdd = clientOnly ? buildPath : '.';
    const appTargetPath = clientOnly ? `/src/${buildPath}` : '/src';
    const nginxConfTargetLocation = clientOnly
        ? '/etc/nginx/conf.d/default.conf'
        : '/src/nginx.conf';

    const nginxNonRootPart = runFromNonRootUser
        ? `RUN chown -R nginx:nginx /src && \\
       mkdir -p /var/lib/nginx && \\
       chown -R nginx:nginx /var/lib/nginx && \\
       chown -R nginx:nginx /var/log/nginx && \\
       chown -R nginx:nginx /etc/nginx/conf.d

   RUN touch /var/run/nginx.pid && \\
       chown -R nginx:nginx /var/run/nginx.pid

   USER nginx`
        : '';

    return `
FROM ${baseDockerImage}
ARG START_SH_LOCATION
ARG NGINX_CONF_LOCATION
ARG NGINX_BASE_CONF_LOCATION

WORKDIR /src
ADD $START_SH_LOCATION /src/start.sh
ADD $NGINX_CONF_LOCATION ${nginxConfTargetLocation}
${nginx ? 'ADD $NGINX_BASE_CONF_LOCATION /etc/nginx/nginx.conf' : ''}

${nginxNonRootPart}

${
    runFromNonRootUser
        ? `ADD --chown=nginx:nginx ${appPathToAdd} ${appTargetPath}`
        : `ADD ${appPathToAdd} ${appTargetPath}`
}
${clientOnly ? 'COPY env-config.jso[n] /src/' : ''}
${clientOnly ? 'CMD ["nginx"]' : ''}
`;
}
