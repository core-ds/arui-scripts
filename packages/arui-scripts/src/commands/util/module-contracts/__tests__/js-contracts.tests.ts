import fs from 'fs';

import { checkPackedConsumer, createPortableProject } from '../__fixtures__/portable-contract';

describe('JS dependencies of TypeScript module contracts', () => {
    let project: ReturnType<typeof createPortableProject>;

    beforeEach(() => {
        project = createPortableProject({ allowJs: true, checkJs: true });
        project.write(
            'src/helper.js',
            '/** @param {number} delta */ export const makeResult = (delta) => ({ balance: 42 + delta });',
        );
        project.write(
            'src/index.ts',
            "import { makeResult } from './helper.js'; export { makeResult } from './helper.js'; export const factory = (params: { account: string }) => makeResult(params.account.length);",
        );
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        fs.rmSync(project.root, { recursive: true, force: true });
        jest.restoreAllMocks();
    });

    it('packs declarations for JS helpers and preserves their public types in an isolated consumer', async () => {
        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const balance: number = widget.factory({ account: '123' }).balance;
            const helperBalance: number = widget.makeResult(1).balance;
            // @ts-expect-error The JS helper must not lose its inferred result.
            const invalid: string = widget.makeResult(1).balance;
            // @ts-expect-error JSDoc parameter types must survive publishing.
            widget.makeResult('1');
        `,
        );
    }, 30000);
});
