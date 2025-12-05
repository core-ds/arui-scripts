import { createWatchIgnoreRegex } from '../create-watch-ignore-regex';

describe('createWatchIgnoreRegex', () => {
    it('should match complete directory names', () => {
        const regex = createWatchIgnoreRegex(['build', 'node_modules']);

        expect('/project/build/index.js').toMatch(regex);
        expect('C:\\project\\build\\index.js').toMatch(regex);
        expect('build/index.js').toMatch(regex);
        expect('/build').toMatch(regex);
        expect('\\build').toMatch(regex);

        expect('/project/node_modules/package/index.js').toMatch(regex);
        expect('C:\\project\\node_modules\\package\\index.js').toMatch(regex);
        expect('node_modules/package/index.js').toMatch(regex);
    });

    it('should NOT match partial directory names', () => {
        const regex = createWatchIgnoreRegex(['build', 'node_modules']);

        expect('/project/building/index.js').not.toMatch(regex);
        expect('src/building-filters.tsx').not.toMatch(regex);
        expect('rebuild/index.js').not.toMatch(regex);

        expect('/project/my_node_modules/index.js').not.toMatch(regex);
        expect('backup_node_modules/index.js').not.toMatch(regex);
    });

    it('should handle empty array', () => {
        const regex = createWatchIgnoreRegex([]);

        expect('/project/build/index.js').not.toMatch(regex);
        expect('/project/src/index.js').not.toMatch(regex);
    });

    it('should work cross-platform with both Unix and Windows separators', () => {
        const regex = createWatchIgnoreRegex(['dist']);

        expect('/project/dist/bundle.js').toMatch(regex);
        expect('src/dist/output.js').toMatch(regex);

        expect('C:\\project\\dist\\bundle.js').toMatch(regex);
        expect('src\\dist\\output.js').toMatch(regex);

        expect('C:\\project/dist/bundle.js').toMatch(regex);
    });

    it('should escape special regex characters', () => {
        const regex = createWatchIgnoreRegex(['test.d.ts']);

        expect('/project/test.d.ts/index.js').toMatch(regex);
        expect('/project/testadats/index.js').not.toMatch(regex);
    });
});
