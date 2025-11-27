import { type DevTool, type Shared } from '@rspack/core';
import { type RspackDevServer } from '@rspack/dev-server';
import { type PluginOptions as ReactCompilerOptions } from 'babel-plugin-react-compiler';

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
    proxy: RspackDevServer['options']['proxy'];
    clientOnly: boolean;

    // paths
    buildPath: string;
    assetsPath: string;
    additionalBuildPath: string[];
    statsOutputFilename: string;
    serverEntry: string | string[] | Record<string, string | string[]>;
    serverOutput: string;
    clientPolyfillsEntry: null | string | string[];
    clientEntry: string | string[] | Record<string, string | string[]>;

    // docker compilation configs
    dockerRegistry: string;
    baseDockerImage: string;
    nginxRootPath: string;
    nginx: {
        workerProcesses?: number;
        workerRlimitNoFile?: number;
        workerConnections?: number;
        eventsUse?: string;
        daemon?: string;
    } | null;
    runFromNonRootUser: boolean;
    removeDevDependenciesDuringDockerBuild: boolean;
    // archive compilation configs
    archiveName: string;

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
};

export type ModuleConfigBase = {
    cssPrefix?: false | string;
    useSeparateBuild?: boolean;
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
