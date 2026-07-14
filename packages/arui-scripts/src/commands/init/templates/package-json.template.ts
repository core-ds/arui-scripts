import { type TemplateContext } from '../types';

function sortKeys(record: Record<string, string>): Record<string, string> {
    return Object.keys(record)
        .sort()
        .reduce<Record<string, string>>((acc, key) => {
            acc[key] = record[key];

            return acc;
        }, {});
}


export function packageJsonTemplate(ctx: TemplateContext): string {
    const scripts: Record<string, string> = {
        start: 'arui-scripts start',
        build: 'arui-scripts build',
        test: ctx.testRunner === 'jest' ? 'arui-scripts test' : 'arui-scripts test:vitest',
    };

    if (ctx.dockerRegistry) {
        scripts['docker-build'] = 'arui-scripts docker-build';
    }

    const pkg: Record<string, unknown> = {
        name: ctx.name,
        version: '0.1.0',
        private: true,
        scripts,
    };

    if (ctx.testRunner === 'jest') {
        pkg.jest = { preset: 'arui-scripts' };
    }

    pkg.dependencies = sortKeys(ctx.dependencies);
    pkg.devDependencies = sortKeys(ctx.devDependencies);

    return `${JSON.stringify(pkg, null, 4)}\n`;
}
