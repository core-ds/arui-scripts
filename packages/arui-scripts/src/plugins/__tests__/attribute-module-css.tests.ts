import { AttributeModuleCssPlugin } from '../attribute-module-css';

/**
 * Тесты обхода графа чанков плагином. rspack-объекты мокаем: нам важна логика
 * поиска контейнерного модуля, сопоставления блок→экспоуз и сбора css чанк-групп.
 */

type MockChunk = { files: string[] };
type MockGroup = { chunks: MockChunk[] };

function createChunk(files: string[]): MockChunk {
    return { files };
}

function createBlock(request: string) {
    return { dependencies: [{ request }] };
}

type CollectInput = {
    exposes: Record<string, unknown>;
    containerIdentifier?: string;
    blocks: Array<ReturnType<typeof createBlock>>;
    // block -> chunk-group (по индексу блока)
    groups: Array<MockGroup | null>;
    // модули, помимо контейнерного, чтобы проверить поиск по identifier
    extraModuleIdentifiers?: string[];
};

function runCollect({
    exposes,
    containerIdentifier = 'container entry (default) [["Module",{}]]',
    blocks,
    groups,
    extraModuleIdentifiers = ['./src/some-other-module'],
}: CollectInput): Map<string, string[]> {
    const target = new Map<string, string[]>();
    const plugin = new AttributeModuleCssPlugin(exposes as Record<string, string>, target);

    const containerModule = { identifier: () => containerIdentifier, blocks };
    const otherModules = extraModuleIdentifiers.map((id) => ({
        identifier: () => id,
        blocks: [],
    }));

    const compilation = {
        modules: new Set([...otherModules, containerModule]),
        chunkGraph: {
            getBlockChunkGroup: (block: unknown) => groups[blocks.indexOf(block as never)] ?? null,
        },
    };

    // collect — приватный метод, вызываем напрямую для проверки логики обхода
    (plugin as unknown as { collect: (c: unknown) => void }).collect(compilation);

    return target;
}

describe('AttributeModuleCssPlugin', () => {
    it('attributes css of the expose chunk group to the expose name', () => {
        const target = runCollect({
            exposes: {
                Module: './src/modules/module/index',
                ServerStateModule: './src/modules/server-state-module/index',
            },
            blocks: [
                createBlock('./src/modules/module/index'),
                createBlock('./src/modules/server-state-module/index'),
            ],
            groups: [
                { chunks: [createChunk(['wmf-464.js', 'wmf-464.chunk.css'])] },
                { chunks: [createChunk(['wmf-58.js', 'wmf-58.chunk.css'])] },
            ],
        });

        expect(target.get('Module')).toEqual(['wmf-464.chunk.css']);
        expect(target.get('ServerStateModule')).toEqual(['wmf-58.chunk.css']);
    });

    it('omits exposes without css', () => {
        const target = runCollect({
            exposes: { Module: './src/modules/module/index' },
            blocks: [createBlock('./src/modules/module/index')],
            groups: [{ chunks: [createChunk(['wmf-1.js'])] }],
        });

        expect(target.has('Module')).toBe(false);
    });

    it('collects css from synchronous split chunks in the same group and dedupes', () => {
        const target = runCollect({
            exposes: { Module: './src/modules/module/index' },
            blocks: [createBlock('./src/modules/module/index')],
            groups: [
                {
                    chunks: [
                        createChunk(['wmf-464.js', 'shared.chunk.css']),
                        createChunk(['vendor.js', 'shared.chunk.css', 'own.chunk.css']),
                    ],
                },
            ],
        });

        expect(target.get('Module')).toEqual(['shared.chunk.css', 'own.chunk.css']);
    });

    it('supports object and array expose configs', () => {
        const target = runCollect({
            exposes: {
                ObjExpose: { import: './src/modules/obj/index' },
                ArrExpose: ['./src/modules/arr/index'],
            },
            blocks: [
                createBlock('./src/modules/obj/index'),
                createBlock('./src/modules/arr/index'),
            ],
            groups: [
                { chunks: [createChunk(['obj.chunk.css'])] },
                { chunks: [createChunk(['arr.chunk.css'])] },
            ],
        });

        expect(target.get('ObjExpose')).toEqual(['obj.chunk.css']);
        expect(target.get('ArrExpose')).toEqual(['arr.chunk.css']);
    });

    it('ignores blocks whose request is not a declared expose', () => {
        const target = runCollect({
            exposes: { Module: './src/modules/module/index' },
            blocks: [createBlock('./src/some/lazy/import')],
            groups: [{ chunks: [createChunk(['lazy.chunk.css'])] }],
        });

        expect(target.size).toBe(0);
    });

    it('does nothing when there is no container entry module', () => {
        const target = runCollect({
            exposes: { Module: './src/modules/module/index' },
            containerIdentifier: 'not a container',
            blocks: [],
            groups: [],
        });

        expect(target.size).toBe(0);
    });
});
