import type * as rspack from '@rspack/core';
import { type Configuration as RspackDevServerConfiguration } from '@rspack/dev-server';
import { type Options as SwcOptions } from '@swc/core';

import { configs } from '../app-configs';
import { type AppContextWithConfigs } from '../app-configs/types';
import { type createSingleClientWebpackConfig } from '../rspack.client';

import { type findLoader } from './find-loader';
import { type createFindPluginFunction } from './find-plugin';

type Overrides = {
    rspack: rspack.Configuration | rspack.Configuration[];
    rspackClient: rspack.Configuration | rspack.Configuration[];
    rspackDev: rspack.Configuration | rspack.Configuration[];
    rspackClientDev: rspack.Configuration | rspack.Configuration[];
    rspackServer: rspack.Configuration;
    rspackServerDev: rspack.Configuration;
    rspackProd: rspack.Configuration;
    rspackClientProd: rspack.Configuration | rspack.Configuration[];
    rspackServerProd: rspack.Configuration;
    devServer: RspackDevServerConfiguration;
    stats: rspack.RspackOptionsNormalized['stats'];

    /* eslint-disable @typescript-eslint/no-explicit-any */
    babel: any; // TODO: где взять typedef-ы для бабеля?
    babelClient: any;
    babelServer: any;
    babelDependencies: any;
    /* eslint-enable @typescript-eslint/no-explicit-any */

    swc: SwcOptions;
    swcServer: SwcOptions;
    swcClient: SwcOptions;
    swcJest: SwcOptions;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    postcss: any[]; // TODO: где взять typedef-ы для postcss
    browsers: string[];
    supportingBrowsers: string[];
    supportingNode: string[];

    Dockerfile: string;
    DockerfileCompiled: string;
    nginx: string;
    nginxConf: string;
    'start.sh': string;
    serverExternalsExemptions: Array<string | RegExp>;

    html: string;
};

// Маппинг устаревших webpack-ключей оверрайдов на актуальные ключи для rspack
// Поддержка webpack-ключей будет скоро удалена.
const DEPRECATED_OVERRIDE_KEYS = {
    webpack: 'rspack',
    webpackClient: 'rspackClient',
    webpackDev: 'rspackDev',
    webpackClientDev: 'rspackClientDev',
    webpackServer: 'rspackServer',
    webpackServerDev: 'rspackServerDev',
    webpackProd: 'rspackProd',
    webpackClientProd: 'rspackClientProd',
    webpackServerProd: 'rspackServerProd',
} as const;

type DeprecatedOverrideKey = keyof typeof DEPRECATED_OVERRIDE_KEYS;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;
type BoundCreateSingleClientWebpackConfig = OmitFirstArg<typeof createSingleClientWebpackConfig>;

type ClientRspackAdditionalArgs = {
    createSingleClientWebpackConfig: BoundCreateSingleClientWebpackConfig;
    findLoader: typeof findLoader;
    findPlugin: ReturnType<typeof createFindPluginFunction<'client'>>;
};

type ServerRspackAdditionalArgs = {
    findLoader: typeof findLoader;
    findPlugin: ReturnType<typeof createFindPluginFunction<'server'>>;
};

/**
 * Дополнительные аргументы, которые будут переданы в функцию оверрайда
 */
type OverridesAdditionalArgs = {
    rspack: ClientRspackAdditionalArgs;
    rspackClient: ClientRspackAdditionalArgs;
    rspackDev: ClientRspackAdditionalArgs;
    rspackClientDev: ClientRspackAdditionalArgs;
    rspackProd: ClientRspackAdditionalArgs;
    rspackClientProd: ClientRspackAdditionalArgs;
    rspackServer: ServerRspackAdditionalArgs;
    rspackServerDev: ServerRspackAdditionalArgs;
    rspackServerProd: ServerRspackAdditionalArgs;

    /** @deprecated используйте rspack */
    webpack: ClientRspackAdditionalArgs;
    /** @deprecated используйте rspackClient */
    webpackClient: ClientRspackAdditionalArgs;
    /** @deprecated используйте rspackDev */
    webpackDev: ClientRspackAdditionalArgs;
    /** @deprecated используйте rspackClientDev */
    webpackClientDev: ClientRspackAdditionalArgs;
    /** @deprecated используйте rspackProd */
    webpackProd: ClientRspackAdditionalArgs;
    /** @deprecated используйте rspackClientProd */
    webpackClientProd: ClientRspackAdditionalArgs;
    /** @deprecated используйте rspackServer */
    webpackServer: ServerRspackAdditionalArgs;
    /** @deprecated используйте rspackServerDev */
    webpackServerDev: ServerRspackAdditionalArgs;
    /** @deprecated используйте rspackServerProd */
    webpackServerProd: ServerRspackAdditionalArgs;
};

type OverrideFunction<K extends keyof Overrides> = (
    config: Overrides[K],
    appConfig: AppContextWithConfigs,
    additionalArgs: K extends keyof OverridesAdditionalArgs
        ? OverridesAdditionalArgs[K]
        : undefined,
) => Overrides[K];

export type OverrideFile = {
    [K in keyof Overrides]?: OverrideFunction<K>;
} & Partial<Record<DeprecatedOverrideKey, OverrideFunction<'rspack'>>>;

/**
 * Переносит устаревшие webpack-ключи оверрайдов на актуальные rspack-ключи и
 * предупреждает о необходимости миграции. Если заданы оба ключа — приоритет у
 * нового, устаревший игнорируется.
 */
function normalizeDeprecatedOverrideKeys(override: OverrideFile): OverrideFile {
    const result: Record<string, unknown> = { ...override };

    (Object.keys(DEPRECATED_OVERRIDE_KEYS) as DeprecatedOverrideKey[]).forEach((deprecatedKey) => {
        if (!Object.prototype.hasOwnProperty.call(result, deprecatedKey)) {
            return;
        }

        const newKey = DEPRECATED_OVERRIDE_KEYS[deprecatedKey];

        console.warn(
            `[arui-scripts] Ключ оверрайда "${deprecatedKey}" устарел, используйте "${newKey}". ` +
                `Поддержка "${deprecatedKey}" будет скоре удалена.`,
        );

        if (!Object.prototype.hasOwnProperty.call(result, newKey)) {
            result[newKey] = result[deprecatedKey];
        }

        delete result[deprecatedKey];
    });

    return result as OverrideFile;
}

let overrides: OverrideFile[] = [];

overrides = configs.overridesPath.map((path) => {
    try {
        // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
        const requireResult = require(path);

        // eslint-disable-next-line no-underscore-dangle
        if (requireResult.__esModule) {
            // ts-node импортирует esModules, из них надо вытягивать default именно так
            return normalizeDeprecatedOverrideKeys(requireResult.default);
        }

        return normalizeDeprecatedOverrideKeys(requireResult);
    } catch (e) {
        console.error(`Unable to process override file "${path}"`);
        console.log(e);

        return {};
    }
});

/**
 *
 * @param {String|String[]} overridesKey Ключи оверрайда
 * @param {Object} config Конфиг, к которому нужно применить оверрайды
 * @param args Дополнительные аргументы, которые будут переданы в функцию оверрайда
 * @returns {*}
 */
export function applyOverrides<
    T extends Overrides[Key],
    Key extends keyof Overrides,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Args = Key extends keyof OverridesAdditionalArgs ? OverridesAdditionalArgs[Key] : undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
>(overridesKey: Key | Key[], config: T, args?: any): T {
    if (typeof overridesKey === 'string') {
        // eslint-disable-next-line no-param-reassign
        overridesKey = [overridesKey];
    }
    overridesKey.forEach((key) => {
        overrides.forEach((override) => {
            if (Object.prototype.hasOwnProperty.call(override, key)) {
                const overrideFn = override[key];

                if (typeof overrideFn !== 'function') {
                    throw new TypeError(`Override ${key} must be a function`);
                }
                // eslint-disable-next-line no-param-reassign
                // @ts-expect-error Union type conflict between rspack and deprecated webpack keys - resolved at runtime
                // eslint-disable-next-line @typescript-eslint/no-explicit-any,no-param-reassign
                config = overrideFn(config, configs, args) as T;
            }
        });
    });

    return config;
}
