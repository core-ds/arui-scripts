// TODO: remove eslint-disable-next-line
import type { Configuration as WebpackConfiguration, WebpackOptionsNormalized } from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';

import appConfigs from '../app-configs';
import { AppContextWithConfigs } from '../app-configs/types';
import { createSingleClientWebpackConfig } from '../webpack.client';

import { findLoader } from './find-loader';

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
};

/**
 * Дополнительные аргументы, которые будут переданы в функцию оверрайда
 */
type OverridesAdditionalArgs = {
    webpack: ClientWebpackAdditionalArgs;
    webpackClient: ClientWebpackAdditionalArgs;
    webpackDev: ClientWebpackAdditionalArgs;
    webpackClientDev: ClientWebpackAdditionalArgs;
};

type OverrideFunction<
    K extends keyof Overrides,
    AdditionalArgs = K extends keyof OverridesAdditionalArgs
        ? OverridesAdditionalArgs[K]
        : undefined,
> = (
    config: Overrides[K],
    appConfig: AppContextWithConfigs,
    additionalArgs: AdditionalArgs,
) => Overrides[K];

export type OverrideFile = {
    [K in keyof Overrides]?: OverrideFunction<K>;
};

let overrides: OverrideFile[] = [];

overrides = appConfigs.overridesPath.map((path) => {
    try {
        // eslint-disable-next-line import/no-dynamic-require, global-require, @typescript-eslint/no-var-requires
        const requireResult = require(path);

        // eslint-disable-next-line no-underscore-dangle
        if (requireResult.__esModule) {
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
function applyOverrides<
    T extends Overrides[Key],
    Key extends keyof Overrides,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Args = Key extends keyof OverridesAdditionalArgs ? OverridesAdditionalArgs[Key] : undefined,
>(overridesKey: Key | Key[], config: T, args?: any): T {
    if (typeof overridesKey === 'string') {
        // eslint-disable-next-line no-param-reassign
        overridesKey = [overridesKey];
    }
    overridesKey.forEach((key) => {
        overrides.forEach((override) => {
            // eslint-disable-next-line no-prototype-builtins
            if (override.hasOwnProperty(key)) {
                const overrideFn = override[key];

                if (typeof overrideFn !== 'function') {
                    throw new TypeError(`Override ${key} must be a function`);
                }
                // eslint-disable-next-line no-param-reassign
                config = overrideFn(config, appConfigs, args);
            }
        });
    });

    return config;
}

export default applyOverrides;
