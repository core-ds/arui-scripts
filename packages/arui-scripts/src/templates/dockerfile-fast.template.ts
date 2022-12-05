import configs from '../configs/app-configs';
import applyOverrides from '../configs/util/apply-overrides';

const dockerfileTemplate = `
FROM ${configs.baseDockerImage}
ARG START_SH_LOCATION
ARG NGINX_CONF_LOCATION

WORKDIR /src
ADD $START_SH_LOCATION /src/start.sh
ADD $NGINX_CONF_LOCATION /src/nginx.conf
ADD . /src
RUN yarn install --no-progress --ignore-optional --frozen-lockfile --unsafe-perm && \\
    yarn build && \\
    yarn install --production --ignore-optional --frozen-lockfile --ignore-scripts --prefer-offline  && \\
    yarn cache clean

RUN chown -R nginx:nginx /src && chmod -R 755 /src && \
       mkdir -p /var/lib/nginx && \
       chown -R nginx:nginx /var/lib/nginx && \
       chown -R nginx:nginx /var/log/nginx && \
       chown -R nginx:nginx /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
   chown -R nginx:nginx /var/run/nginx.pid

USER nginx
`;

export default applyOverrides('Dockerfile-fast', dockerfileTemplate);
