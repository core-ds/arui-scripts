const { resolve } = require('path');

const project = resolve(process.cwd(), 'tsconfig.eslint.json');

module.exports = {
    extends: [require.resolve('arui-presets-lint/eslint')],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: [project],
    },
    overrides: [
        {
            files: [
                './arui-scripts.config.ts',
                './arui-scripts.overrides.ts',
                './global-definitions.d.ts',
            ],
            rules: {
                'import/no-default-export': 'off',
            },
        },
    ],
    rules: {
        'no-trailing-spaces': 'error',
        'no-multiple-empty-lines': 'error',
        'react-hooks/exhaustive-deps': 'warn',
        'import/no-extraneous-dependencies': [
            'error',
            {
                devDependencies: ['cypress/**/*.ts', '**/*.test.{ts,tsx,js,jsx}'],
            },
        ],
        'import/no-default-export': 'error',
        indent: 'off', // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/indent.md
    },
    ignorePatterns: ['coverage'],
};
