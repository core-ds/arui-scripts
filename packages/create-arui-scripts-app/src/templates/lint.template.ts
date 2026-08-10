export function eslintConfigTemplate(): string {
    return `import { defineConfig, eslintConfig, TYPESCRIPT_SCRIPTS_SCOPE } from 'arui-presets-lint/eslint';

export default defineConfig(eslintConfig, [
    {
        languageOptions: {
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        'arui-scripts.config.ts',
                        'eslint.config.mts',
                        'knip.ts',
                        'vitest.config.ts',
                    ],
                },
            },
        },
        files: [TYPESCRIPT_SCRIPTS_SCOPE],
    },
]);
`;
}

export function knipConfigTemplate(): string {
    return `import baseConfig from 'arui-presets-lint/knip';

export default {
    ...baseConfig,
    // ts-jest подключается через jest.preset arui-scripts, прямых импортов в коде нет
    ignoreDependencies: [...baseConfig.ignoreDependencies, 'ts-jest'],
};
`;
}

export function secretlintConfigTemplate(): string {
    return `${JSON.stringify(
        {
            rules: [
                {
                    id: '@secretlint/secretlint-rule-preset-recommend',
                },
            ],
        },
        null,
        4,
    )}\n`;
}

export function lefthookConfigTemplate(): string {
    return `extends:
    - ./node_modules/arui-presets-lint/lefthook/index.yml
`;
}
