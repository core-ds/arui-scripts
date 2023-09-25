import configs from '../configs/app-configs';
import applyOverrides from '../configs/util/apply-overrides';

const nginxNonRootPart = configs.runFromNonRootUser
    ? `RUN chown -R nginx:nginx /src && \\
       mkdir -p /var/lib/nginx && \\
       chown -R nginx:nginx /var/lib/nginx && \\
       chown -R nginx:nginx /var/log/nginx && \\
       chown -R nginx:nginx /etc/nginx/conf.d

   RUN touch /var/run/nginx.pid && \\
       chown -R nginx:nginx /var/run/nginx.pid

   USER nginx`
    : '';

const dockerfileTemplate = `
FROM ${configs.baseDockerImage}
ARG START_SH_LOCATION
ARG NGINX_CONF_LOCATION

WORKDIR /src
ADD $START_SH_LOCATION /src/start.sh
ADD $NGINX_CONF_LOCATION /src/nginx.conf
${nginxNonRootPart}
${configs.runFromNonRootUser ? 'ADD --chown=nginx:nginx . /src' : 'ADD . /src'}

`;

export default applyOverrides('Dockerfile', dockerfileTemplate);
