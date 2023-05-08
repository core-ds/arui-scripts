/**
 * Конфигурация arui-scripts, которая может быть переопределена приложением
 */
export type AppConfigs = {
    dockerRegistry: string;
    baseDockerImage: string;
    buildPath: string;
    assetsPath: string;
    additionalBuildPath: string[];
    nginxRootPath: string;
    runFromNonRootUser: boolean;
    archiveName: string;

    serverEntry: string | string[] | Record<string, string | string[]>;
    serverOutput: string;

    clientPolyfillsEntry: null | string | string[];
    clientEntry: string;
    keepPropTypes: boolean;

    devSourceMaps: string;
    useTscLoader: boolean;
    useServerHMR: boolean;
    webpack4Compatibility: boolean;

    clientServerPort: number;
    serverPort: number;
    installServerSourceMaps: boolean;

    debug: boolean;

    removeDevDependenciesDuringDockerBuild: boolean;

    componentsTheme: string | undefined;
    keepCssVars: boolean;
    statsOutputFilename: string;
};

/**
 * Внутренний контекст arui-scripts
 */
export type AppContext = {
    appPackage: any;
    name: string;
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
