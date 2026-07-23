import { type DevTool, type Shared } from '@rspack/core';
import { type Configuration as DevServerConfiguration } from '@rspack/dev-server';
import { type PluginOptions as ReactCompilerOptions } from 'babel-plugin-react-compiler';
import type webpackNodeExternals from 'webpack-node-externals';
import { z } from 'zod';

/**
 * zod-схема пользовательской конфигурации arui-scripts — единственный источник истины:
 * из неё выводится тип `AppConfigs` (`z.infer`) и она же используется для рантайм-валидации
 * (неизвестные ключи, типы значений, кросс-полевые правила).
 *
 * Тяжёлые внешние типы (`DevTool`, `proxy`, `Shared`, `ReactCompilerOptions`, `nodeExternals`)
 * оборачиваются в `z.custom<T>()`: тип сохраняется точно, а рантайм-проверку структуры для них
 * мы не выполняем (она нецелесообразна для сложных сторонних типов).
 */

const entrySchema = z.union([
    z.string(),
    z.array(z.string()),
    z.record(z.string(), z.union([z.string(), z.array(z.string())])),
]);

export const moduleConfigBaseSchema = z.object({
    cssPrefix: z.union([z.literal(false), z.string()]).optional(),
    useSeparateBuild: z.boolean().optional(),
    separateBuildShared: z.custom<Shared>().optional(),
});

const compatModuleConfigBaseSchema = z.object({
    cssPrefix: z.union([z.literal(false), z.string()]).optional(),
    entry: z.string(),
    externals: z.record(z.string(), z.string()).optional(),
});

export const appConfigsSchema = z.object({
    // general settings
    clientServerPort: z.number(),
    serverPort: z.number(),
    debug: z.boolean(),
    devSourceMaps: z.custom<DevTool>(),
    devServerCors: z.boolean(),
    useServerHMR: z.boolean(),
    presets: z.string().nullable(),
    proxy: z.custom<DevServerConfiguration['proxy']>(),
    clientOnly: z.boolean(),

    // paths
    buildPath: z.string(),
    assetsPath: z.string(),
    additionalBuildPath: z.array(z.string()),
    statsOutputFilename: z.string(),
    serverEntry: entrySchema,
    serverOutput: z.string(),
    clientPolyfillsEntry: z.union([z.string(), z.array(z.string())]).nullable(),
    clientEntry: entrySchema,

    // docker compilation configs
    dockerRegistry: z.string(),
    baseDockerImage: z.string(),
    nginxRootPath: z.string(),
    nginx: z
        .object({
            workerProcesses: z.number().optional(),
            workerRlimitNoFile: z.number().optional(),
            workerConnections: z.number().optional(),
            eventsUse: z.string().optional(),
            daemon: z.string().optional(),
        })
        .nullable(),
    runFromNonRootUser: z.boolean(),
    removeDevDependenciesDuringDockerBuild: z.boolean(),

    // archive compilation configs
    archiveName: z.string(),

    dictionaryCompression: z.object({
        dictionaryPath: z.array(z.string()),
        enablePreviousVersionHeaders: z.boolean().optional(),
    }),

    // build tuning
    keepPropTypes: z.boolean(),
    codeLoader: z.enum(['babel', 'tsc', 'swc']),
    experimentalReactCompiler: z.union([z.literal('disabled'), z.custom<ReactCompilerOptions>()]),
    installServerSourceMaps: z.boolean(),
    disableDevRspackTypecheck: z.boolean(),
    /** @deprecated используйте `disableDevRspackTypecheck` */
    disableDevWebpackTypecheck: z.boolean().optional(),
    jestCodeTransformer: z.enum(['babel', 'tsc', 'swc']),
    collectCoverage: z.boolean(),

    // image processing
    dataUrlMaxSize: z.number().optional(),
    imageMinimizer: z
        .object({
            svg: z.object({ enabled: z.boolean().optional() }).optional(),
            gif: z
                .object({
                    enabled: z.boolean().optional(),
                    optimizationLevel: z.number().optional(),
                })
                .optional(),
            jpg: z
                .object({
                    enabled: z.boolean().optional(),
                    quality: z.number(),
                })
                .optional(),
            png: z
                .object({
                    enabled: z.boolean().optional(),
                    optimizationLevel: z.number().optional(),
                    bitDepthReduction: z.boolean().optional(),
                    colorTypeReduction: z.boolean().optional(),
                    paletteReduction: z.boolean().optional(),
                    interlaced: z.boolean().optional(),
                })
                .optional(),
        })
        .optional(),

    // CSS
    componentsTheme: z.string().nullable(),
    keepCssVars: z.boolean(),

    // Modules
    disableModulesSupport: z.boolean(),
    compatModules: z
        .object({
            shared: z.record(z.string(), z.string()).optional(),
            exposes: z.record(z.string(), compatModuleConfigBaseSchema).optional(),
        })
        .nullable(),
    modules: z
        .object({
            name: z.string().optional(),
            shared: z.custom<Shared>(),
            exposes: z.record(z.string(), z.string()).optional(),
            options: moduleConfigBaseSchema.optional(),
            shareScope: z.string().optional(),
        })
        .nullable(),
    nodeExternals: z.custom<Omit<webpackNodeExternals.Options, 'allowlist'>>().optional(),
});

export type AppConfigs = z.infer<typeof appConfigsSchema>;
export type ModuleConfigBase = z.infer<typeof moduleConfigBaseSchema>;
export type CompatModuleConfigBase = z.infer<typeof compatModuleConfigBaseSchema>;
