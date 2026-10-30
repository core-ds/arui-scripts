import { type DevTool, type Shared } from '@rspack/core';
import { type Configuration as DevServerConfiguration } from '@rspack/dev-server';
import { type PluginOptions as ReactCompilerOptions } from 'babel-plugin-react-compiler';
import type NodeExternals from 'webpack-node-externals';

import { type NginxBaseConfOptions } from '@alfalab/arui-scripts-artifacts';

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
     * Значения по умолчанию задаются в @alfalab/arui-scripts-artifacts (`resolveArtifactsConfig`),
     * поэтому здесь они опциональны: arui-scripts только транслирует то, что задал пользователь.
     *
     * Эти настройки — поддерживаемая часть конфигурации arui-scripts.
     */
    dockerRegistry?: string;
    baseDockerImage?: string;
    nginxRootPath?: string;
    nginx?: NginxBaseConfOptions | null;
    runFromNonRootUser?: boolean;
    removeDevDependenciesDuringDockerBuild?: boolean;
    deleteNpm?: boolean;
    archiveName?: string;
    /**
     * Директории проекта, которые кладутся в tar-архив рядом со сборкой.
     */
    additionalBuildPath?: string[];

    dictionaryCompression: {
        dictionaryPath: string[];
        enablePreviousVersionHeaders?: boolean;
    };

    // build tuning
    buildSizeBudgets: BuildSizeBudgets | null;
    keepPropTypes: boolean;
    codeLoader: 'babel' | 'tsc' | 'swc';
    experimentalReactCompiler: 'disabled' | ReactCompilerOptions;
    installServerSourceMaps: boolean;
    disableDevRspackTypecheck: boolean;
    jestCodeTransformer: 'babel' | 'tsc' | 'swc';
    jestTransformNodeModules: string[];
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
    nodeExternals?: Omit<NodeExternals.Options, 'allowlist'>;
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

export const BUILD_SIZE_ASSET_TYPES = ['js', 'css'] as const;
export const BUILD_SIZE_METRICS = ['raw', 'gzip'] as const;

export type BuildSizeAssetType = (typeof BUILD_SIZE_ASSET_TYPES)[number];
export type BuildSizeMetric = (typeof BUILD_SIZE_METRICS)[number];

export type BuildSizeLimit = { [metric in BuildSizeMetric]?: number };

/** Absolute initial asset limits per client entrypoint, in bytes. */
export type BuildSizeBudgets = { [type in BuildSizeAssetType]?: BuildSizeLimit };
