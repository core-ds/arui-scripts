import fs from 'fs';
import path from 'path';

import { checkPackedConsumer, createPortableProject } from '../__fixtures__/portable-contract';

describe('local dependencies with separate declarations', () => {
    let project: ReturnType<typeof createPortableProject>;

    beforeEach(() => {
        project = createPortableProject();
        project.write('../foo/package.json', '{"name":"foo","version":"1.2.3","main":"index.js"}');
        project.write('../foo/index.js', 'module.exports = {};');
        project.write(
            '../foo-types/package.json',
            '{"name":"@types/foo","version":"1.2.4","types":"index.d.ts"}',
        );
        project.write('../foo-types/index.d.ts', 'export type DTO = { account: string };');
        fs.mkdirSync(path.join(project.cwd, 'node_modules/@types'), { recursive: true });
        fs.symlinkSync(
            path.join(project.root, 'foo'),
            path.join(project.cwd, 'node_modules/foo'),
            'dir',
        );
        fs.symlinkSync(
            path.join(project.root, 'foo-types'),
            path.join(project.cwd, 'node_modules/@types/foo'),
            'dir',
        );
        project.write(
            'src/index.ts',
            "import type { DTO } from 'foo'; export function factory(params: DTO) { return params.account; }",
        );
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        fs.rmSync(project.root, { recursive: true, force: true });
        jest.restoreAllMocks();
    });

    it('requires only the installed package that provides the declarations', async () => {
        project.write(
            'package.json',
            JSON.stringify({
                name: 'provider',
                version: '1.0.0',
                dependencies: { foo: 'workspace:*' },
                devDependencies: { '@types/foo': '1.2.4' },
            }),
        );
        const metadata = await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const account: string = widget.factory({ account: '123' });
            // @ts-expect-error The separately published DTO must retain its fields.
            widget.factory({ account: 123 });
        `,
            { '@types/foo': path.join(project.root, 'foo-types') },
        );

        expect(metadata.peerDependencies).toEqual({ '@types/foo': '^1.2.0' });
    }, 30000);
});
