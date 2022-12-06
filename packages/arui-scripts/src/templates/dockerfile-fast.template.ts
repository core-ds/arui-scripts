import configs from '../configs/app-configs';
import applyOverrides from '../configs/util/apply-overrides';

const dockerfileTemplate = `
FROM ${configs.baseDockerImage}
ARG START_SH_LOCATION
ARG NGINX_CONF_LOCATION

USER nginx
WORKDIR /src
RUN mkdir -p /var/lib/nginx && \
    chown -R nginx:nginx /var/lib/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d

RUN touch /var/run/nginx.pid && \
   chown -R nginx:nginx /var/run/nginx.pid

ADD $START_SH_LOCATION /src/start.sh
ADD $NGINX_CONF_LOCATION /src/nginx.conf
ADD --chown=nginx:nginx yarn.lock /src/yarn.lock
ADD --chown=nginx:nginx package.json /src/package.json
RUN yarn install --production --ignore-optional --frozen-lockfile --ignore-scripts --prefer-offline  && \\
    yarn cache clean
ADD --chown=nginx:nginx . /src
`;

export default applyOverrides('Dockerfile-fast', dockerfileTemplate);
