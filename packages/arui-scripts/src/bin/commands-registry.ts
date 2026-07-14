/* eslint-disable global-require */
/* eslint import/no-dynamic-require: 0 */

export type CliCommand = {
    name: string;
    description: string;
    help?: string;
    args?: string;
    passthrough?: boolean; // для проброса аргументов во вне
    load: () => void;
};

export const commands: CliCommand[] = [
    {
        name: 'init',
        args: '[dir]',
        description: 'Создает шаблонный проект arui-scripts (интерактивный мастер)',
        help: 'arui-scripts init [dir] генерирует новый проект, задавая вопросы о настройках.',
        load: () => require('../commands/init'),
    },
    {
        name: 'start',
        description: 'Dev-сервер для клиента и серверный код в watch-режиме',
        load: () => require('../commands/start'),
    },
    {
        name: 'start:prod',
        description:
            'То же, что start, но с production-конфигурацией rspack (для метрик производительности)',
        load: () => require('../commands/start-prod'),
    },
    {
        name: 'build',
        description: 'Production-сборка клиентского и серверного кода',
        load: () => require('../commands/build'),
    },
    {
        name: 'docker-build',
        description: 'Production-сборка, создание docker-образа и пуш в registry',
        help: [
            'Имя образа формируется как {dockerRegistry}/{name}:{version}.',
            'name и version по умолчанию берутся из package.json, но их можно переопределить:',
            '  arui-scripts docker-build name=container-name version=0.1-beta',
        ].join('\n'),
        passthrough: true,
        load: () => require('../commands/docker-build'),
    },
    {
        name: 'docker-build:compiled',
        description:
            'Как docker-build, но использует уже скомпилированный код из .build (для CI/CD)',
        help: [
            'Поддерживает те же опции, что и docker-build (name=, version=).',
            'Внимание: не работает в clientOnly-режиме.',
        ].join('\n'),
        passthrough: true,
        load: () => require('../commands/docker-build-compiled'),
    },
    {
        name: 'test',
        description: 'Запускает jest с конфигурацией arui-scripts',
        help: 'Все аргументы после команды пробрасываются в jest (например: arui-scripts test --watch).',
        passthrough: true,
        load: () => require('../commands/test'),
    },
    {
        name: 'test:vitest',
        description: 'Запускает unit-тесты через vitest',
        help: [
            'Использует vitest.config.* из корня проекта, иначе конфигурацию arui-scripts.',
            'Все аргументы после команды пробрасываются в vitest.',
        ].join('\n'),
        passthrough: true,
        load: () => require('../commands/test-vitest'),
    },
    {
        name: 'ensure-yarn',
        description: 'Завершается с кодом 1, если проект запущен не через yarn',
        load: () => require('../commands/ensure-yarn'),
    },
    {
        name: 'archive-build',
        description:
            'Собирает tar-архив с production-сборкой (.build, node_modules, package.json, config)',
        load: () => require('../commands/archive-build'),
    },
    {
        name: 'bundle-analyze',
        description: 'Запускает webpack-bundle-analyzer и rsdoctor для анализа бандла и сборки',
        load: () => require('../commands/bundle-analyze'),
    },
    {
        name: 'changelog',
        description: 'postchangelog-хук standard-version: формирует описание версии в CHANGELOG.md',
        load: () => require('../commands/changelog'),
    },
];
