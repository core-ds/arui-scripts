module.exports = {
    root: true,
    extends: ['custom/common'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    ignorePatterns: ['./src/templates/dockerfile-compiled.template.ts', '.turbo'],
    rules: {
        'import/no-default-export': 'warn',
        'import/no-named-as-default': 'warn',
        // чтобы могли использовать for и генераторы
        'no-restricted-syntax': 'off',
        'class-methods-use-this': ['error', { exceptMethods: ['generate'] }],
        // чтобы можно было игнорировать неиспользуемые аргументы и переменные, которые начинаются с _
        '@typescript-eslint/no-unused-vars': [
            'warn',
            {
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_',
                caughtErrorsIgnorePattern: '^_',
            },
        ],
    },
};
