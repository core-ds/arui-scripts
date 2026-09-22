import { type Options } from '@swc/core';
// browserslist — peer зависимость кучи других пакетов, поэтому не добавляем её себе в прямые (см. commands/util/load-browserslist.ts)
// eslint-disable-next-line import/no-extraneous-dependencies
import { loadConfig } from 'browserslist';

import { applyOverrides } from './util/apply-overrides';
import { resolveSwcTargets } from './util/swc-targets';
import { configs } from './app-configs';
import { supportingBrowsers } from './supporting-browsers';
import { supportingNode } from './supporting-node';

function createJscConfig(): Options['jsc'] {
    return {
        parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true,
        },
        loose: false,
        transform: {
            legacyDecorator: true,
            react: {
                runtime: 'automatic',
            },
        },
        experimental: configs.collectCoverage
            ? {
                  plugins: [['swc-plugin-coverage-instrument', {}]],
              }
            : {},
    };
}

/**
 * Без явных `env.targets` SWC резолвит список браузеров сам, своим browserslist-rs, который расходится с JS-версией,
 * поэтому цели считаем здесь и передаём готовыми. Приоритет тот же, что в loadBrowserslist:
 * собственный конфиг browserslist проекта (или переменная BROWSERSLIST), иначе дефолты arui-scripts.
 */
const swcClientBaseConfig: Options = {
    // Среди node_modules и кода приложения встречается CommonJS. Без автоопределения swc считает такие файлы
    // ES-модулями и при externalHelpers вставляет в них import, из-за чего module.exports ломается в рантайме.
    isModule: 'unknown',
    env: {
        coreJs: '3',
        mode: 'entry',
        targets: resolveSwcTargets(loadConfig({ path: configs.cwd }) ?? supportingBrowsers),
    },
    jsc: {
        ...createJscConfig(),
        // Хелперы импортируются из @swc/helpers, а не дублируются в каждом модуле
        externalHelpers: true,
    },
};

const swcServerBaseConfig: Options = {
    isModule: 'unknown',
    env: {
        targets: resolveSwcTargets(supportingNode),
    },
    jsc: createJscConfig(),
};

const swcJestBaseConfig: Options = {
    isModule: 'unknown',
    env: {
        coreJs: '3',
        mode: 'entry',
        // Тесты исполняет node, а не браузер: без явных целей swc резолвил бы список браузеров сам
        targets: resolveSwcTargets(supportingNode),
    },
    jsc: createJscConfig(),
};

export const swcClientConfig = applyOverrides(['swc', 'swcClient'], swcClientBaseConfig);

export const swcServerConfig = applyOverrides(['swc', 'swcServer'], swcServerBaseConfig);

export const swcJestConfig = applyOverrides(['swc', 'swcJest'], swcJestBaseConfig);

/**
 * Опции swc для кода из node_modules: те же цели компиляции и хелперы, что и у кода приложения,
 * но без парсера и трансформов приложения — сторонний код уже скомпилирован.
 */
export function getSwcDependenciesOptions(config: Options): Options {
    const options: Options = {
        isModule: config.isModule,
        env: config.env,
    };

    if (config.jsc?.externalHelpers) {
        options.jsc = { externalHelpers: true };
    }

    return options;
}
