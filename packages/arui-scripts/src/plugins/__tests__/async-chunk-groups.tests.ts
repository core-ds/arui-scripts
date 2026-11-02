import { AsyncChunkGroupsPlugin, type ChunkGroupFiles } from '../async-chunk-groups';

/**
 * Тесты сбора файлов чанк-групп. rspack-объекты мокаем: нам важна логика выбора групп
 * (только именованные async, без энтрипоинтов) и разбора файлов чанков на js и css.
 */

type RunInput = {
    // имя чанк-группы -> файлы каждого из ее чанков (в порядке загрузки)
    groups: Record<string, string[][]>;
    entrypoints?: string[];
    target?: Map<string, ChunkGroupFiles>;
};

function runPlugin({ groups, entrypoints = [], target = new Map() }: RunInput) {
    const plugin = new AsyncChunkGroupsPlugin(target);

    let processAssets: () => void = () => {
        throw new Error('processAssets hook was not tapped');
    };

    const compilation = {
        outputOptions: { publicPath: 'assets/' },
        getPath: (value: string) => value,
        entrypoints: new Map(entrypoints.map((name) => [name, {}])),
        namedChunkGroups: new Map(
            Object.entries(groups).map(([name, chunks]) => [
                name,
                { chunks: chunks.map((files) => ({ files: new Set(files) })) },
            ]),
        ),
        hooks: {
            processAssets: {
                tap: (_options: unknown, fn: () => void) => {
                    processAssets = fn;
                },
            },
        },
    };
    const compiler = {
        hooks: {
            thisCompilation: { tap: (_name: string, fn: (c: unknown) => void) => fn(compilation) },
        },
    };

    plugin.apply(compiler as never);
    processAssets();

    return target;
}

describe('AsyncChunkGroupsPlugin', () => {
    it('collects own and shared chunk files of an async chunk group in load order', () => {
        const target = runPlugin({
            groups: {
                'page-a': [['787.1.chunk.js'], ['page-a.2.chunk.js', 'page-a.2.chunk.css']],
            },
        });

        expect(target.get('page-a')).toEqual({
            publicPath: 'assets/',
            js: ['787.1.chunk.js', 'page-a.2.chunk.js'],
            css: ['page-a.2.chunk.css'],
        });
    });

    it('does not collect entrypoints', () => {
        const target = runPlugin({
            entrypoints: ['main'],
            groups: {
                main: [['vendor.js'], ['main.js']],
                'page-a': [['page-a.chunk.js']],
            },
        });

        expect(Array.from(target.keys())).toEqual(['page-a']);
    });

    it('dedupes files repeated across chunks of one group', () => {
        const target = runPlugin({
            groups: {
                'page-a': [
                    ['shared.chunk.js', 'shared.chunk.css'],
                    ['shared.chunk.js', 'page-a.chunk.js', 'shared.chunk.css'],
                ],
            },
        });

        expect(target.get('page-a')).toEqual({
            publicPath: 'assets/',
            js: ['shared.chunk.js', 'page-a.chunk.js'],
            css: ['shared.chunk.css'],
        });
    });

    it('keeps only js and css files', () => {
        const target = runPlugin({
            groups: {
                'page-a': [
                    [
                        'page-a.chunk.js',
                        'page-a.chunk.js.map',
                        'page-a.chunk.css?v=1',
                        'page-a.hot-update.js',
                        'static/logo.png',
                    ],
                ],
            },
        });

        expect(target.get('page-a')).toEqual({
            publicPath: 'assets/',
            js: ['page-a.chunk.js'],
            css: ['page-a.chunk.css?v=1'],
        });
    });

    it('returns empty lists for a group without js and css', () => {
        const target = runPlugin({ groups: { empty: [['logo.png']] } });

        expect(target.get('empty')).toEqual({ js: [], css: [], publicPath: 'assets/' });
    });

    it('keeps groups collected by another compilation', () => {
        const target = new Map<string, ChunkGroupFiles>([
            ['from-other-build', { js: ['other.chunk.js'], css: [], publicPath: 'assets/' }],
        ]);

        runPlugin({ target, groups: { 'page-a': [['page-a.chunk.js']] } });

        expect(Array.from(target.keys())).toEqual(['from-other-build', 'page-a']);
    });

    it('replaces the files of a group on rebuild', () => {
        const target = new Map<string, ChunkGroupFiles>();

        runPlugin({ target, groups: { 'page-a': [['page-a.old.chunk.js', 'old.chunk.css']] } });
        runPlugin({ target, groups: { 'page-a': [['page-a.new.chunk.js']] } });

        expect(target.get('page-a')).toEqual({
            js: ['page-a.new.chunk.js'],
            css: [],
            publicPath: 'assets/',
        });
    });
});
