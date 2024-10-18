import { type DevTool } from '@rspack/core/dist/config/zod';
import { ProxyConfigArrayItem } from 'webpack-dev-server';

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
    proxy: null | {
        [url: string]: ProxyConfigArrayItem;
    };
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
    runFromNonRootUser: boolean;
    removeDevDependenciesDuringDockerBuild: boolean;
    // archive compilation configs
    archiveName: string;

    // build tuning
    keepPropTypes: boolean;
    /**
     * @deprecated использование ts-loader крайне не рекомендуется - он медленнее и не имеет преимуществ перед babel
     */
    useTscLoader: boolean;
    codeLoader: 'babel' | 'tsc' | 'swc';
    /**
     * @deprecated эта настройка будет удалена в будущих версиях скриптов
     */
    webpack4Compatibility: boolean;
    installServerSourceMaps: boolean;
    disableDevWebpackTypecheck: boolean;
    /**
     * @deprecated используйте настройку jestCodeTransformer
     */
    jestUseTsJest: boolean;
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
        shared: any; // webpack don't expose this type
        exposes?: Record<string, string>;
        options?: ModuleConfigBase;
    } | null;
};

export type ModuleConfigBase = {
    cssPrefix?: false | string;
};

type CompatModuleConfigBase  = ModuleConfigBase & {
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
};

export type AppContextWithConfigs = AppContext & AppConfigs;

export type PackageSettings = Partial<AppConfigs>;
