import { getInstallProductionCommand, getYarnVersion } from '../commands/util/yarn';
import { configs } from '../configs/app-configs';
import { applyOverrides } from '../configs/util/apply-overrides';

const installProductionCommand = getInstallProductionCommand();
const yarnVersion = getYarnVersion();

const { nginx } = configs;

// В зависимости от используемого мендежера зависимостей для их установки нужно копировать разный набор файлов
const filesRequiredToInstallDependencies = [
    'package.json',
    'yarn.lock',
    yarnVersion === '2+' && '.yarnrc.yml',
    yarnVersion === '2+' && '.yarn',
    yarnVersion === 'unavailable' && 'package-lock.json',
].filter(Boolean);

const template = `
FROM ${configs.baseDockerImage}
ARG START_SH_LOCATION
ARG NGINX_CONF_LOCATION
ARG NGINX_BASE_CONF_LOCATION

WORKDIR /src

# Полу-статичные файлы, могут легко кешироваться
ADD $START_SH_LOCATION /src/start.sh
ADD $NGINX_CONF_LOCATION /src/nginx.conf
${nginx ? 'ADD $NGINX_BASE_CONF_LOCATION /etc/nginx/nginx.conf' : ''}

# Зависимости. При некоторой удаче могут кешироваться и соответственно кешировать установку зависимостей
${filesRequiredToInstallDependencies
    .map((file) => `ADD --chown=nginx:nginx ${file} /src/${file}`)
    .join('\n')}

RUN ${installProductionCommand}  && \\
    ${yarnVersion === 'unavailable' ? 'npm cache clean --force' : 'yarn cache clean'}

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

export const dockerfileTemplate = applyOverrides('DockerfileCompiled', template);
