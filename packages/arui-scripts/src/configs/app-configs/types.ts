import { type DevTool, type Shared } from '@rspack/core';
import { type Configuration as DevServerConfiguration } from '@rspack/dev-server';
import { type PluginOptions as ReactCompilerOptions } from 'babel-plugin-react-compiler';
import type webpackNodeExternals from 'webpack-node-externals';

import { type NginxBaseConfOptions } from '@alfalab/scripts-artifacts';

/**
 * Конфигурация arui-scripts, которая может быть переопределена приложением
 */
export type AppConfigs = {
    // general settings
    clientServerPort: number;
    serverPort: number;
    debug: boolean;
    devSourceMaps: DevTool;
    devServerCors: boolean;
    useServerHMR: boolean;
    presets: string | null;
    proxy: DevServerConfiguration['proxy'];
    clientOnly: boolean;

    // paths
    buildPath: string;
    assetsPath: string;
    statsOutputFilename: string;
    serverEntry: string | string[] | Record<string, string | string[]>;
    serverOutput: string;
    clientPolyfillsEntry: null | string | string[];
    clientEntry: string | string[] | Record<string, string | string[]>;

    /*
     * Настройки сборки docker-образа и tar-архива.
     *
     * Значения по умолчанию задаются в @alfalab/scripts-artifacts (`resolveArtifactsConfig`),
     * поэтому здесь они опциональны: arui-scripts только транслирует то, что задал пользователь.
     *
     * Все они объявлены устаревшими и будут удалены в следующей мажорной версии — их место в
     * конфиге `arui-scripts-artifacts.ts`.
     */
    /** @deprecated Используйте `docker.registry` в конфиге @alfalab/scripts-artifacts. */
    dockerRegistry?: string;
    /** @deprecated Используйте `docker.baseImage` в конфиге @alfalab/scripts-artifacts. */
    baseDockerImage?: string;
    /** @deprecated Используйте `nginx.rootPath` в конфиге @alfalab/scripts-artifacts. */
    nginxRootPath?: string;
    /** @deprecated Используйте `nginx.baseConf` в конфиге @alfalab/scripts-artifacts. */
    nginx?: NginxBaseConfOptions | null;
    /** @deprecated Используйте `docker.runFromNonRootUser` в конфиге @alfalab/scripts-artifacts. */
    runFromNonRootUser?: boolean;
    /** @deprecated Используйте `build.removeDevDependencies` в конфиге @alfalab/scripts-artifacts. */
    removeDevDependenciesDuringDockerBuild?: boolean;
    /** @deprecated Используйте `archive.name` в конфиге @alfalab/scripts-artifacts. */
    archiveName?: string;
    /**
     * Директории проекта, которые кладутся в tar-архив рядом со сборкой.
     * @deprecated Используйте `archive.additionalPaths` в конфиге @alfalab/scripts-artifacts.
     */
    additionalBuildPath?: string[];

    dictionaryCompression: {
        dictionaryPath: string[];
        enablePreviousVersionHeaders?: boolean;
    };

    // build tuning
    keepPropTypes: boolean;
    codeLoader: 'babel' | 'tsc' | 'swc';
    experimentalReactCompiler: 'disabled' | ReactCompilerOptions;
    installServerSourceMaps: boolean;
    disableDevWebpackTypecheck: boolean;
    jestCodeTransformer: 'babel' | 'tsc' | 'swc';
    collectCoverage: boolean;

    // image processing
    dataUrlMaxSize?: number;
    imageMinimizer?: {
        svg?: {
            enabled?: boolean;
        };
        gif?: {
            enabled?: boolean;
            optimizationLevel?: number;
        };
        jpg?: {
            enabled?: boolean;
            quality: number;
        };
        png?: {
            enabled?: boolean;
            optimizationLevel?: number;
            bitDepthReduction?: boolean;
            colorTypeReduction?: boolean;
            paletteReduction?: boolean;
            interlaced?: boolean;
        };
    };

    // CSS
    componentsTheme: string | null;
    keepCssVars: boolean;

    // Modules
    disableModulesSupport: boolean;
    compatModules: {
        shared?: {
            [libraryName: string]: string;
        };
        exposes?: {
            [moduleId: string]: CompatModuleConfigBase;
        };
    } | null;
    modules: {
        name?: string;
        shared: Shared;
        exposes?: Record<string, string>;
        options?: ModuleConfigBase;
        shareScope?: string;
    } | null;
    nodeExternals?: Omit<webpackNodeExternals.Options, 'allowlist'>;
};

export type ModuleConfigBase = {
    cssPrefix?: false | string;
    useSeparateBuild?: boolean;
    separateBuildShared?: Shared;
};

type CompatModuleConfigBase = {
    cssPrefix?: false | string;
    entry: string;
    externals?: Record<string, string>;
};

export type CompatModuleConfig = CompatModuleConfigBase & {
    name: string;
};

/**
 * Внутренний контекст arui-scripts
 */
export type AppContext = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    appPackage: any;
    name: string;
    normalizedName: string;
    version: string;

    cwd: string;
    appSrc: string;
    appNodeModules: string;
    appNodeModulesBin: string;
    babelRuntimeVersion: string;
    useYarn: boolean;

    tsconfig: string | null;
    localNginxConf: string | null;
    localNginxBaseConf: string | null;
    localDockerfile: string | null;
    localStartScript: string | null;

    overridesPath: string[];

    publicPath: string;
    serverOutputPath: string;
    clientOutputPath: string;
    statsOutputPath: string;
    watchIgnorePath: string[];

    changelogPath: string;
    changelogTmpPath: string;
    changelogFeaturesPath: string;
    changelogBugfixesPath: string;
    changelogBreakingChangesPath: string;

    compressionPreviousVersionPath: string[];
    compressionPredefinedDictionaryPath: string[];
};

export type AppContextWithConfigs = AppContext & AppConfigs;

export type PackageSettings = Partial<AppConfigs>;
