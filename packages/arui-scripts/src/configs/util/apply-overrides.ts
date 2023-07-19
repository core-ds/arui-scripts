import type { Configuration as WebpackConfiguration, WebpackOptionsNormalized } from 'webpack';
import type { Configuration as WebpackDevServerConfiguration } from 'webpack-dev-server';
import appConfigs from '../app-configs';
import { AppConfigs } from '../app-configs/types';
import { createSingleClientWebpackConfig } from "../webpack.client";

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
    'DockerfileCompiled': string;
    nginx: string;
    'start.sh': string;
    serverExternalsExemptions: Array<string | RegExp>;
};

type OmitFirstArg<F> = F extends (x: any, ...args: infer P) => infer R ? (...args: P) => R : never;
type BoundCreateSingleClientWebpackConfig = OmitFirstArg<typeof createSingleClientWebpackConfig>;

type ClientWebpackAdditionalArgs = {
    createSingleClientWebpackConfig: BoundCreateSingleClientWebpackConfig;
}

/**
 * Дополнительные аргументы, которые будут переданы в функцию оверрайда
 */
type OverridesAdditionalArgs = {
    webpack: ClientWebpackAdditionalArgs;
    webpackClient: ClientWebpackAdditionalArgs;
    webpackDev: ClientWebpackAdditionalArgs;
    webpackClientDev: ClientWebpackAdditionalArgs;
}

type OverrideFunction<K extends keyof Overrides, AdditionalArgs = K extends keyof OverridesAdditionalArgs ? OverridesAdditionalArgs[K] : undefined> = (
    config: Overrides[K],
    appConfig: AppConfigs,
    additionalArgs: AdditionalArgs
) => Overrides[K];

export type OverrideFile = {
    [K in keyof Overrides]?: OverrideFunction<K>;
}

let overrides: Array<OverrideFile> = [];

overrides = appConfigs.overridesPath.map(path => {
    try {
        const requireResult = require(path);
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
    Args = Key extends keyof OverridesAdditionalArgs ? OverridesAdditionalArgs[Key] : undefined
>(overridesKey: Key | Key[], config: T, args?: any): T {
    if (typeof overridesKey === 'string') {
        overridesKey = [overridesKey];
    }
    overridesKey.forEach(key => {
        overrides.forEach((override) =>{
            if (override.hasOwnProperty(key)) {
                const overrideFn = override[key];
                if (typeof overrideFn !== 'function') {
                    throw new TypeError(`Override ${key} must be a function`)
                }
                config = overrideFn(config, appConfigs, args);
            }
        });
    });

    return config;
}

export default applyOverrides;
