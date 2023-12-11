import type { Configuration as WebpackConfiguration, WebpackOptionsNormalized } from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

import appConfigs from '../app-configs';
import { AppContextWithConfigs } from '../app-configs/types';
import { createSingleClientWebpackConfig } from '../webpack.client';

import { findLoader } from './find-loader';
import { findPlugin } from './find-plugin';

type Overrides = {
    webpack: WebpackConfiguration | WebpackConfiguration[];
    webpackClient: WebpackConfiguration | WebpackConfiguration[];
    webpackDev: WebpackConfiguration | WebpackConfiguration[];
    webpackClientDev: WebpackConfiguration | WebpackConfiguration[];
    webpackServer: WebpackConfiguration;
    webpackServerDev: WebpackConfiguration;
    webpackProd: WebpackConfiguration;
    webpackClientProd: WebpackConfiguration | WebpackConfiguration[];
    webpackServerProd: WebpackConfiguration;
    devServer: WebpackDevServerConfiguration;
    stats: WebpackOptionsNormalized['stats'];

    babel: any; // TODO: где взять typedef-ы для бабеля?
    babelClient: any;
    babelServer: any;
    babelDependencies: any;

    postcss: any[]; // TODO: где взять typedef-ы для postcss
    browsers: string[];
    supportingBrowsers: string[];

    Dockerfile: string;
    DockerfileCompiled: string;
    nginx: string;
    'start.sh': string;
    serverExternalsExemptions: Array<string | RegExp>;
};

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;
type BoundCreateSingleClientWebpackConfig = OmitFirstArg<typeof createSingleClientWebpackConfig>;

type ClientWebpackAdditionalArgs = {
    createSingleClientWebpackConfig: BoundCreateSingleClientWebpackConfig;
    findLoader: typeof findLoader;
    findPlugin: ReturnType<typeof findPlugin<'client'>>;
};

type ServerWebpackAdditionalArgs = {
    findLoader: typeof findLoader;
    findPlugin: ReturnType<typeof findPlugin<'server'>>;
};

/**
 * Дополнительные аргументы, которые будут переданы в функцию оверрайда
 */
type OverridesAdditionalArgs = {
    webpack: ClientWebpackAdditionalArgs;
    webpackClient: ClientWebpackAdditionalArgs;
    webpackDev: ClientWebpackAdditionalArgs;
    webpackClientDev: ClientWebpackAdditionalArgs;
    webpackProd: ClientWebpackAdditionalArgs;
    webpackClientProd: ClientWebpackAdditionalArgs;
    webpackServer: ServerWebpackAdditionalArgs;
    webpackServerDev: ServerWebpackAdditionalArgs;
    webpackServerProd: ServerWebpackAdditionalArgs;
};

type OverrideFunction<
    K extends keyof Overrides,
    AdditionalArgs = K extends keyof OverridesAdditionalArgs
        ? OverridesAdditionalArgs[K]
        : undefined,
> = (
    config: Overrides[K],
    appConfig: AppContextWithConfigs,
    additionalArgs: AdditionalArgs | unknown,
) => Overrides[K];

export type OverrideFile = {
    [K in keyof Overrides]?: OverrideFunction<K>;
};

let overrides: OverrideFile[] = [];

overrides = appConfigs.overridesPath.map((path) => {
    try {
        // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
        const requireResult = require(path);

        if ('__esModule' in requireResult) {
            // ts-node импортирует esModules, из них надо вытягивать default именно так
            return requireResult.default;
        }

        return requireResult;
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
function applyOverrides<T extends Overrides[Key], Key extends keyof Overrides>(
    overridesKey: Key | Key[],
    config: T,
    args?: unknown,
): T {
    let tempConfig = config;
    const overrideKeys = typeof overridesKey === 'string' ? [overridesKey] : overridesKey;

    overrideKeys.forEach((key) => {
        overrides.forEach((override) => {
            if (key in override) {
                const overrideFn = override[key];

                if (typeof overrideFn !== 'function') {
                    throw new TypeError(`Override ${key} must be a function`);
                }

                tempConfig = overrideFn(tempConfig, appConfigs, args);
            }
        });
    });

    return tempConfig;
}

export default applyOverrides;
