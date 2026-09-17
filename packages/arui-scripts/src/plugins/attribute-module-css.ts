import {
    type AsyncDependenciesBlock,
    type ChunkGroup,
    Compilation,
    type Compiler,
    type Module,
    type RspackPluginInstance,
} from '@rspack/core';

const CSS_FILE_REGEXP = /\.css(\?.*)?$/i;

/** Формат значения одного экспоуза в конфиге module federation. */
type ExposeConfigValue = string | string[] | { import: string | string[]; name?: string };

/**
 * Плагин добавляет css module-federation модулей в манифест сборки.
 *
 * По умолчанию для default-модулей `getModuleResources` отдаёт только `remoteEntry.js`,
 * а css-чанки экспоузов остаются в безымянной ("") записи манифеста и не привязаны к
 * конкретному модулю. Из-за этого хост-сервер при SSR не знает, какие стили встроить,
 * и серверная разметка модуля отрисовывается без стилей до загрузки модуля на клиенте.
 *
 * Плагин обходит граф чанков от каждого экспоуза (async-блоки контейнерного энтрипоинта
 * module federation), собирает css чанк-группы экспоуза (включая её синхронные части —
 * splitChunks добавляет их в ту же чанк-группу) и записывает их в разделяемый map,
 * откуда `processAssetsPluginOutput` дописывает css в запись модуля манифеста.
 * Обход именно по графу чанков (а не по именам чанков) — имена вида
 * `wmf-…_index_tsx.css` это деталь реализации. Css асинхронных чанков внутри экспоуза
 * исключается: лениво подгружаемые компоненты не входят в SSR-html и грузят свой css
 * на клиенте как и раньше (их чанк-группы — дочерние, мы в них не спускаемся).
 */
export class AttributeModuleCssPlugin implements RspackPluginInstance {
    name = 'AttributeModuleCssPlugin';

    /** map: import-путь экспоуза -> имя экспоуза (moduleId в манифесте) */
    private importToExposeName: Map<string, string>;

    /** разделяемый map: имя экспоуза -> css-файлы (сырые имена, без publicPath) */
    private target: Map<string, string[]>;

    constructor(exposes: Record<string, ExposeConfigValue>, target: Map<string, string[]>) {
        this.target = target;
        this.importToExposeName = new Map();

        Object.entries(exposes).forEach(([exposeName, value]) => {
            getExposeImports(value).forEach((importPath) => {
                this.importToExposeName.set(importPath, exposeName);
            });
        });
    }

    apply(compiler: Compiler): void {
        compiler.hooks.thisCompilation.tap(this.name, (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: this.name,
                    // на этой стадии граф чанков и имена файлов уже финальные
                    stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
                },
                () => this.collect(compilation),
            );
        });
    }

    private collect(compilation: Compilation): void {
        // watch-пересборки переиспользуют инстанс — очищаем предыдущий результат
        this.target.clear();

        const containerModule = findContainerEntryModule(compilation);

        if (!containerModule) {
            return;
        }

        (containerModule.blocks || []).forEach((block) => {
            const exposeName = this.getBlockExposeName(block);

            if (!exposeName) {
                return;
            }

            const group = compilation.chunkGraph.getBlockChunkGroup(block);

            if (!group) {
                return;
            }

            const css = collectGroupCss(group);

            if (css.length > 0) {
                const existing = this.target.get(exposeName) ?? [];

                this.target.set(exposeName, unique([...existing, ...css]));
            }
        });
    }

    private getBlockExposeName(block: AsyncDependenciesBlock): string | undefined {
        for (const dependency of block.dependencies) {
            const { request } = dependency;

            if (request && this.importToExposeName.has(request)) {
                return this.importToExposeName.get(request);
            }
        }

        return undefined;
    }
}

function findContainerEntryModule(compilation: Compilation): Module | undefined {
    for (const module of compilation.modules) {
        // идентификатор контейнерного энтрипоинта MF начинается с "container entry"
        if (module.identifier().startsWith('container entry')) {
            return module;
        }
    }

    return undefined;
}

function getExposeImports(value: ExposeConfigValue): string[] {
    if (typeof value === 'string') {
        return [value];
    }

    if (Array.isArray(value)) {
        return value;
    }

    return Array.isArray(value.import) ? value.import : [value.import];
}

function collectGroupCss(group: ChunkGroup): string[] {
    const files = new Set<string>();

    group.chunks.forEach((chunk) => {
        chunk.files.forEach((file) => {
            if (CSS_FILE_REGEXP.test(file)) {
                files.add(file);
            }
        });
    });

    return Array.from(files);
}

function unique(values: string[]): string[] {
    return Array.from(new Set(values));
}
