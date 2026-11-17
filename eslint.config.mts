import {
    defineConfig,
    eslintConfig,
    GLOBAL_SCRIPTS_SCOPE,
    globalIgnores,
    globals,
    TYPESCRIPT_SCRIPTS_SCOPE,
} from 'arui-presets-lint/eslint';

export default defineConfig(
    eslintConfig,
    globalIgnores([
        '**/build/**',
        '**/.build/**',
        '**/.turbo/**',
        '**/coverage/**',
        '**/.yarn/**',
        '**/assets/yarn-*.cjs',
    ]),
    {
        files: ['**/jest.setup.js'],
        rules: {
            'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
        },
    },
    {
        files: ['**/*.{js,cjs,mjs}'],
        languageOptions: {
            globals: globals.node,
        },
    },
    {
        // документация использует таблицы и списки задач GitHub Flavored Markdown
        files: ['**/*.md'],
        language: 'markdown/gfm',
    },
    {
        files: [GLOBAL_SCRIPTS_SCOPE],
        rules: {
            // ограничиваем объем кода, а не комментариев и пустых строк
            'max-lines': ['warn', { max: 300, skipBlankLines: true, skipComments: true }],
        },
    },
    {
        files: ['**/__tests__/**/*.{ts,tsx,js}'],
        rules: {
            // сценарии одной функции остаются в одном тестовом наборе
            'max-lines': ['warn', { max: 1000, skipBlankLines: true, skipComments: true }],
        },
    },
    {
        files: [TYPESCRIPT_SCRIPTS_SCOPE],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        files: ['packages/arui-scripts/**'],
        rules: {
            // в CLI используются циклы, генераторы и вывод в консоль
            'no-restricted-syntax': 'off',
            'no-console': 'off',
            'import-x/no-cycle': 'off',
            'no-restricted-imports': 'off',
            '@typescript-eslint/no-restricted-imports': 'off',
        },
    },
    {
        files: [
            'packages/{arui-scripts-artifacts,create-arui-scripts-app,example-modules}/**',
            '.github/scripts/**',
        ],
        rules: {
            'no-console': 'off',
        },
    },
    {
        files: [
            'packages/{arui-scripts-modules,client-event-bus,create-arui-scripts-app}/**/__tests__/**/*.{ts,tsx}',
        ],
        rules: {
            'import-x/no-extraneous-dependencies': 'off',
        },
    },
    {
        files: ['packages/example*/**/*.{js,cjs,mjs,ts,tsx}'],
        settings: {
            node: { version: '>=22.12.0' },
        },
    },
    {
        files: ['packages/example*/**'],
        settings: {
            react: {
                version: '18.0.0',
            },
        },
    },
);
