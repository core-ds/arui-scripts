import fs from 'fs';

import { checkPackedConsumer, createPortableProject } from '../__fixtures__/portable-contract';

it('includes ambient types used by the contract without changing unrelated host globals', async () => {
    const project = createPortableProject();
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    try {
        project.write('src/dto.d.ts', 'type ContractWidth = number;');
        project.write(
            'src/globals.d.ts',
            'export {}; declare global { interface ContractParams { width: ContractWidth } }',
        );
        project.write('src/local.d.ts', 'interface Window { widgetLocalFlags: string }');
        project.write(
            'src/index.ts',
            'export const factory = (params: ContractParams) => params.width;',
        );

        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare global { interface Window { widgetLocalFlags: number } }
            const local: number = window.widgetLocalFlags;
            declare const widget: ModuleContracts['Widget'];
            const width: number = widget.factory({ width: 123 });
            // @ts-expect-error The reachable ambient types retain their field types.
            widget.factory({ width: '123' });
        `,
        );
    } finally {
        fs.rmSync(project.root, { recursive: true, force: true });
        log.mockRestore();
    }
}, 30000);

it('keeps reference paths when one of them is a substring of another', async () => {
    const project = createPortableProject();
    const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);

    try {
        project.write('src/a.d.ts', 'type ContractWidth = number;');
        project.write('src/dto/a.d.ts', 'type ContractHeight = string;');
        project.write(
            'src/dto/index.d.ts',
            [
                '/// <reference path="../a.d.ts" />',
                '/// <reference path="./a.d.ts" />',
                'export type Size = { width: ContractWidth; height: ContractHeight };',
            ].join('\n'),
        );
        project.write(
            'src/index.ts',
            "import type { Size } from './dto'; export const factory = (size: Size) => size;",
        );

        await checkPackedConsumer(
            project,
            `
            import type { ModuleContracts } from '@fixture/contracts';
            declare const widget: ModuleContracts['Widget'];
            widget.factory({ width: 1, height: '1' });
            // @ts-expect-error Both referenced declarations retain their types.
            widget.factory({ width: '1', height: 1 });
        `,
        );
    } finally {
        fs.rmSync(project.root, { recursive: true, force: true });
        log.mockRestore();
    }
}, 30000);
