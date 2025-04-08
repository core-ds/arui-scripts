import { configs } from '../configs/app-configs';
import { ENV_CONFIG_FILENAME } from '../configs/client-env-config';
import applyOverrides from '../configs/util/apply-overrides';

const startTemplate = `#!/bin/sh

# Подменяем env переменные в nginx конфиге перед стартом
# Сначала заменяем все слова, начинающиеся на $ но без \${} на ~~слово~~
# затем запускаем envsubst, после этого обратно заменяем ~~слово~~ на $слово.
# Это нужно для того, чтоб специальные переменные nginx не подменялись envsubst'ом на
# пустые строки. envsubst будет заменять только \${слово}.
cat ./nginx.conf \\
    | sed 's/\\$\\([a-zA-Z0-9_-]\\{1,\\}\\)/~~\\1~~/g' \\
    | envsubst \\
    | sed 's/~~\\([a-zA-Z0-9_-]\\{1,\\}\\)~~/$\\1/g' \\
    > /etc/nginx/conf.d/default.conf

# Достаем лимит памяти из cgroup, это то, как его докер задает.
if [[ -f /sys/fs/cgroup/cgroup.controllers ]]; then
   max_total_memory=$(cat /sys/fs/cgroup/memory.max)
else
   max_total_memory=$(cat /sys/fs/cgroup/memory/memory.limit_in_bytes)
fi
# Самой nodejs мы не можем отдать совсем всю память, операционная система+nginx все же требуют какого то количества.
# Поэтому мы вычитаем 100мб на нужды ос
node_memory_limit="$(($max_total_memory / 1024 / 1024 - 100))"

# Start the nginx process in background
nginx &

# Start nodejs process
node --max-old-space-size="$node_memory_limit" ./${configs.buildPath}/${configs.serverOutput}
`;

const envConfigTargetPath = `/src/${configs.buildPath}/${ENV_CONFIG_FILENAME}`
const envConfigPath = `/src/${ENV_CONFIG_FILENAME}`;
const htmlPath = `/src/${configs.buildPath}/index.html`;

const clientOnlyStartTemplate = `#!/bin/sh

# Мы подставляем значения из env в env-config.json если он есть, и кладем его в публичную папку.
# Дополнительно подставляем контент полученного файла в index.html
# Так как контент env-config может быть многострочным - дополнительно обрабатываем его через awk.
if [ -f ${envConfigPath} ]; then
    envsubst < ${envConfigPath} > ${envConfigTargetPath}

    # Define the placeholder and the file paths
    PLACEHOLDER='<%= envConfig %>'
    SETTINGS_FILE='${envConfigTargetPath}'
    TARGET_FILE='${htmlPath}'

    # Escape the placeholder for sed usage
    ESCAPED_PLACEHOLDER=$(echo "$PLACEHOLDER" | sed 's/[\\/&]/\\\\&/g')

    # Read the content of the settings and prepare it for substitution
    SETTINGS_CONTENT=$(awk '{printf "%s\\\\n", $0}' "$SETTINGS_FILE")

    # Replace the placeholder in the target file with the content of settings
    cat ${htmlPath} \\
      | sed "s/$ESCAPED_PLACEHOLDER/$SETTINGS_CONTENT/" \\
      > /tmp/index.html

    mv /tmp/index.html ${htmlPath}
fi

nginx`;

export default applyOverrides('start.sh', configs.clientOnly ? clientOnlyStartTemplate : startTemplate);
