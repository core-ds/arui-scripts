import { type TemplateContext } from '../types';

export function appTestTemplate(ctx: TemplateContext): string {
    const vitestImport =
        ctx.testRunner === 'vitest' ? "import { describe, expect, it } from 'vitest';\n\n" : '';

    return `${vitestImport}import { App } from '../app';

describe('App', () => {
    it('описание теста', () => {
        expect(typeof App).toBe('function');
    });
});
`;
}
