import fs from 'fs';
import os from 'os';
import path from 'path';

import postcss, { type Plugin } from 'postcss';

import { postCssGlobalVariables } from '../postcss-global-variables';

describe('global CSS variables and media', () => {
    let cwd: string;

    beforeEach(() => {
        cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'arui-theme-test-'));
    });
    afterEach(() => {
        fs.rmSync(cwd, { recursive: true, force: true });
    });
    test('imports only referenced variables, including transitive references, and cleans temporary root rules', async () => {
        const theme = path.join(cwd, 'theme.css');

        fs.writeFileSync(
            theme,
            ':root{--base:8px;--gap:var(--base);--unused:42px}@custom-media --mobile (max-width:600px);',
        );
        const observed: string[] = [];
        const inspect: Plugin = {
            postcssPlugin: 'inspect-global-values',
            Once(root) {
                observed.push(root.toString());
            },
        };
        const processor = postcss([postCssGlobalVariables({ files: [theme] }), inspect]);
        const result = await processor.process(
            '.a{margin:var(--gap)}@media (--mobile){.b{display:block}}',
            { from: path.join(cwd, 'app.css') },
        );

        expect(observed[0]).toContain('--gap:var(--base)');
        expect(observed[0]).toContain('--base:8px');
        expect(observed[0]).not.toContain('--unused');
        expect(result.css).not.toContain(':root');
        expect(result.css).toContain('@custom-media --mobile (max-width:600px)');
        expect(result.messages).toContainEqual(
            expect.objectContaining({
                type: 'dependency',
                file: theme,
                parent: path.join(cwd, 'app.css'),
            }),
        );
        const next = await processor.process('.next{padding:var(--gap)}', { from: undefined });

        expect(next.css).toBe('.next{padding:var(--gap)}');
        expect(observed[1]).toContain('--base:8px');
    });
    test('works without theme files and leaves unknown variables/media unchanged', async () => {
        const css = '.a{color:var(--unknown)}@media screen and (--missing){.b{display:block}}';
        const result = await postcss([postCssGlobalVariables()]).process(css, { from: undefined });

        expect(result.css).toBe(css);
    });
    test('reports missing theme files', async () => {
        await expect(
            postcss([postCssGlobalVariables({ files: [path.join(cwd, 'missing.css')] })]).process(
                '.a{}',
                { from: undefined },
            ),
        ).rejects.toThrow('ENOENT');
    });
});
