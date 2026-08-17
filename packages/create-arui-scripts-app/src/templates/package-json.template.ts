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

    if (ctx.useLint) {
        scripts['lint:styles'] = 'arui-presets-lint styles --max-warnings=0';
        scripts['lint:scripts'] = 'arui-presets-lint scripts --max-warnings=0';
        scripts.format = 'arui-presets-lint format';
        scripts['format:check'] = 'arui-presets-lint format:check';
        scripts['lint:unused'] = 'arui-presets-lint knip';
        scripts['lint:unused:fix'] = 'arui-presets-lint knip --fix';
        scripts['lint:secrets'] = 'arui-presets-lint secretlint';
        scripts.lint =
            'yarn lint:styles && yarn lint:scripts && yarn format:check && yarn lint:unused && yarn lint:secrets';
        scripts['lint:fix'] =
            'yarn lint:styles --fix && yarn lint:scripts --fix && yarn format && yarn lint:secrets';
    }

    if (ctx.e2eFramework === 'playwright') {
        scripts.e2e = 'playwright test';
        scripts['e2e:ui'] = 'playwright test --ui';
    } else if (ctx.e2eFramework === 'cypress') {
        scripts.e2e = 'cypress run';
        scripts['e2e:open'] = 'cypress open';
    }

    const pkg: Record<string, unknown> = {
        name: ctx.name,
        version: '0.1.0',
        private: true,
        scripts,
        engines: {
            node: '>=24.11.1',
        },
    };

    if (ctx.useLint) {
        pkg.prettier = 'arui-presets-lint/prettier';
        pkg.stylelint = { extends: 'arui-presets-lint/stylelint' };
        pkg.commitlint = { extends: './node_modules/arui-presets-lint/commitlint' };
    }

    if (ctx.testRunner === 'jest') {
        pkg.jest = { preset: 'arui-scripts' };
    }

    pkg.dependencies = sortKeys(ctx.dependencies);
    pkg.devDependencies = sortKeys(ctx.devDependencies);

    return `${JSON.stringify(pkg, null, 4)}\n`;
}
