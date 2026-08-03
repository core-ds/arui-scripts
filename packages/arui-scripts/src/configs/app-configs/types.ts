import { type AppConfigs, type CompatModuleConfigBase } from './schema';

// AppConfigs и ModuleConfigBase выводятся из zod-схемы (schema.ts) — единый источник истины
export type { AppConfigs, ModuleConfigBase } from './schema';

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
