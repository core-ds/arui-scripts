import { type TemplateContext } from '../types';

export function tsconfigTemplate(ctx: TemplateContext): string {
    const types =
        ctx.testRunner === 'jest' ? ['jest', 'node', 'webpack-env'] : ['node', 'webpack-env'];

    const tsconfig = {
        extends: 'arui-scripts/tsconfig.json',
        include: ['global-definitions.d.ts', 'src/**/*.ts', 'src/**/*.tsx'],
        compilerOptions: {
            types,
        },
    };

    return `${JSON.stringify(tsconfig, null, 4)}\n`;
}
