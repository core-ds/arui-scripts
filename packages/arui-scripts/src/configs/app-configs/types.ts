/**
 * Конфигурация arui-scripts, которая может быть переопределена приложением
 */
export type AppConfigs = {
    // general settings
    clientServerPort: number;
    serverPort: number;
    debug: boolean;
    devSourceMaps: string;
    devServerCors: boolean;
    useServerHMR: boolean;
    presets: string | null;

    // paths
    buildPath: string;
    assetsPath: string;
    additionalBuildPath: string[];
    statsOutputFilename: string;
    serverEntry: string | string[] | Record<string, string | string[]>;
    serverOutput: string;
    clientPolyfillsEntry: null | string | string[];
    clientEntry: string;

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
    useTscLoader: boolean;
    webpack4Compatibility: boolean;
    installServerSourceMaps: boolean;

    // CSS
    componentsTheme: string | null;
    keepCssVars: boolean;

    // Modules
    embeddedModules: {
        shared?: {
            [libraryName: string]: string;
        }
        exposes?: {
            [moduleId: string]: EmbeddedModuleConfigBase;
        };
    } | null;
    mfModules: {
        name?: string;
        shared: any; // webpack don't expose this type
        exposes?: Record<string, string>;
    } | null;
    disableModuleTesting: boolean;
};

type EmbeddedModuleConfigBase = {
    entry: string;
    embeddedConfig?: Record<string, string>;
    cssPrefix?: false | string;
}

export type EmbeddedModuleConfig = EmbeddedModuleConfigBase & {
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
