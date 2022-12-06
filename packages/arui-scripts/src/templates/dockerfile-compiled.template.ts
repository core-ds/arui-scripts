import configs from '../configs/app-configs';
import applyOverrides from '../configs/util/apply-overrides';
import { getPruningCommand } from '../commands/util/yarn';

const pruneCommand = getPruningCommand();

const dockerfileTemplate = `
FROM ${configs.baseDockerImage}
ARG START_SH_LOCATION
ARG NGINX_CONF_LOCATION

WORKDIR /src

# Полу-статичные файлы, могут легко кешироваться
ADD $START_SH_LOCATION /src/start.sh
ADD $NGINX_CONF_LOCATION /src/nginx.conf

# Зависимости. При некоторой удаче могут кешироваться и соответственно кешировать установку зависимостей
ADD --chown=nginx:nginx yarn.lock /src/yarn.lock
ADD --chown=nginx:nginx package.json /src/package.json
RUN ${pruneCommand}  && \\
    yarn cache clean

ADD --chown=nginx:nginx . /src

# Создаем директории для nginx и выставляем правильные права
RUN mkdir -p /var/lib/nginx && \
    chown -R nginx:nginx /var/lib/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid && \
   chown -R nginx:nginx /var/run/nginx.pid
USER nginx
`;

export default applyOverrides('DockerfileCompiled', dockerfileTemplate);
