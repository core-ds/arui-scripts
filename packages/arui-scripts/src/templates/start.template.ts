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

# Проверяем наличие файла env-config.json. 
# Если он существует, подставляем значения переменных окружения в него и сохраняем в публичной папке.
if [ -f ${envConfigPath} ]; then
    envsubst < ${envConfigPath} > ${envConfigTargetPath} 2> /tmp/envsubst_error.log
    if [ $? -eq 0 ]; then
        echo "Файл ${envConfigTargetPath} успешно создан."
    else
        echo "Ошибка: Не удалось создать файл ${envConfigTargetPath}. Подробности в /tmp/envsubst_error.log"
        cat /tmp/envsubst_error.log
        exit 1
    fi

    # Экранируем плейсхолдер для корректной работы sed.
    ESCAPED_PLACEHOLDER=$(echo "<%= envConfig %>" | sed 's/[\\/&]/\\\\&/g')

    # Читаем содержимое файла env-config.json и подготавливаем его для подстановки.
    SETTINGS_CONTENT=$(awk '{printf "%s\\\\n", $0}' "${envConfigTargetPath}")

    # Заменяем плейсхолдер в HTML-файле на содержимое env-config.json.
    cat ${htmlPath} | sed "s/$ESCAPED_PLACEHOLDER/$SETTINGS_CONTENT/" > /tmp/index.html

    # Перемещаем обновленный HTML-файл в итоговое местоположение.
    mv /tmp/index.html ${htmlPath}
fi

# Запускаем сервер nginx.
nginx`;

export default applyOverrides('start.sh', configs.clientOnly ? clientOnlyStartTemplate : startTemplate);
