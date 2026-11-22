import fs from 'fs';

import { checkPackedConsumer, createPortableProject } from '../__fixtures__/portable-contract';

describe('JSON dependencies in module contracts', () => {
    let project: ReturnType<typeof createPortableProject>;

    beforeEach(() => {
        project = createPortableProject({ resolveJsonModule: true });
        project.write(
            'src/config.json',
            JSON.stringify({
                width: 300,
                options: { enabled: true },
                tags: ['some'],
                empty: null,
            }),
        );
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    afterEach(() => {
        fs.rmSync(project.root, { recursive: true, force: true });
        jest.restoreAllMocks();
    });

    it('allows a JSON import used only by the implementation', async () => {
        project.write(
            'src/index.ts',
            "import config from './config.json'; export const width = () => config.width;",
        );
        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const width: number = widget.width();
            // @ts-expect-error The implementation's JSON still gives a precise return type.
            const invalid: string = widget.width();
        `,
        );
    }, 30000);

    it('publishes JSON types without requiring JSON files or compiler options in the consumer', async () => {
        project.write('src/index.ts', "export { default as settings } from './config.json';");
        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const width: number = widget.settings.width;
            const enabled: boolean = widget.settings.options.enabled;
            const tag: string = widget.settings.tags[0];
            const empty: null = widget.settings.empty;
            // @ts-expect-error JSON types must not degrade to any.
            const invalid: string = widget.settings.width;
        `,
        );
    }, 30000);

    it('preserves the JSON object imported with require in a CommonJS entrypoint', async () => {
        const config = JSON.parse(fs.readFileSync(project.config.tsconfig, 'utf8'));

        config.compilerOptions.module = 'nodenext';
        config.compilerOptions.moduleResolution = 'nodenext';
        project.write('tsconfig.json', JSON.stringify(config));
        project.config.modules.exposes.Widget = './src/index.cts';
        project.write(
            'src/index.cts',
            "import config = require('./config.json'); const width: number = config.width; export { config };",
        );
        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const width: number = widget.config.width;
            const enabled: boolean = widget.config.options.enabled;
            // @ts-expect-error The object from require must retain its property types.
            const invalid: string = widget.config.width;
        `,
        );
    }, 30000);

    it('preserves a namespace JSON import', async () => {
        project.write(
            'src/index.ts',
            "import * as config from './config.json'; const width: number = config.width; export { config };",
        );
        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            const width: number = widget.config.width;
            // @ts-expect-error Namespace imports must not introduce a default-only wrapper.
            const invalid: string = widget.config.width;
        `,
        );
    }, 30000);
});
