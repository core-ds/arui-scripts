import {
    type ChunkGroup,
    Compilation,
    type Compiler,
    type RspackPluginInstance,
} from '@rspack/core';

const JS_FILE_REGEXP = /\.m?js(\?.*)?$/i;
const CSS_FILE_REGEXP = /\.css(\?.*)?$/i;
const HOT_UPDATE_REGEXP = /\.hot-update\./;

/** Сырые имена файлов чанк-группы и publicPath ее компиляции. */
export type ChunkGroupFiles = {
    js: string[];
    css: string[];
    publicPath: string;
};

/**
 * Плагин собирает полный список js и css файлов каждой именованной async чанк-группы.
 *
 * `assets-webpack-plugin` кладет в манифест только собственные файлы чанка, а общие чанки,
 * на которые его разрезал splitChunks (у них нет имени, только числовой id), попадают в
 * безымянную ("") запись манифеста и не привязаны к конкретной странице. Из-за этого
 * SSR не знает, какие файлы нужны лениво загружаемой странице, и клиент догружает их
 * дополнительными запросами уже после отрисовки.
 *
 * Плагин читает файлы чанк-группы целиком (splitChunks добавляет общие чанки в ту же
 * группу) и записывает их в разделяемый map, откуда `processAssetsPluginOutput`
 * дописывает их в манифест под именем группы (имя из `webpackChunkName`).
 * Энтрипоинты пропускаем: их записи в манифесте (`main`, `vendor`) читаются
 * по отдельности, и полный список файлов в `main` продублировал бы `vendor`.
 */
export class AsyncChunkGroupsPlugin implements RspackPluginInstance {
    name = 'AsyncChunkGroupsPlugin';

    /** разделяемый map: имя чанк-группы -> ее js и css файлы */
    private target: Map<string, ChunkGroupFiles>;

    constructor(target: Map<string, ChunkGroupFiles>) {
        this.target = target;
    }

    apply(compiler: Compiler): void {
        const previousGroups = new Map<string, ChunkGroupFiles>();

        compiler.hooks.thisCompilation.tap(this.name, (compilation) => {
            compilation.hooks.processAssets.tap(
                {
                    name: this.name,
                    // на этой стадии граф чанков и имена файлов уже финальные
                    stage: Compilation.PROCESS_ASSETS_STAGE_REPORT,
                },
                () => this.collect(compilation, previousGroups),
            );
        });
    }

    private collect(compilation: Compilation, previousGroups: Map<string, ChunkGroupFiles>): void {
        // Удаляем только прежние записи этого compiler, не затрагивая записи других сборок.
        previousGroups.forEach((files, name) => {
            if (this.target.get(name) === files) {
                this.target.delete(name);
            }
        });
        previousGroups.clear();

        const publicPath = compilation.getPath(compilation.outputOptions.publicPath || '');

        compilation.namedChunkGroups.forEach((group, name) => {
            if (!compilation.entrypoints.has(name)) {
                const files = collectGroupFiles(group, publicPath);

                this.target.set(name, files);
                previousGroups.set(name, files);
            }
        });
    }
}

function collectGroupFiles(group: ChunkGroup, publicPath: string): ChunkGroupFiles {
    const js = new Set<string>();
    const css = new Set<string>();

    group.chunks.forEach((chunk) => {
        chunk.files.forEach((file) => {
            if (HOT_UPDATE_REGEXP.test(file)) {
                return;
            }
            if (JS_FILE_REGEXP.test(file)) {
                js.add(file);
            } else if (CSS_FILE_REGEXP.test(file)) {
                css.add(file);
            }
        });
    });

    return { js: Array.from(js), css: Array.from(css), publicPath };
}
