module.exports = {
    root: true,
    extends: [require.resolve('arui-presets-lint/eslint')],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    rules: {
        // имя свободной переменной задаёт webpack, переименовать её мы не можем
        'no-underscore-dangle': ['error', { allow: ['__webpack_share_scopes__'] }],
    },
    overrides: [
        {
            files: ['**/__tests__/**/*.{ts,tsx}'],
            rules: {
                'import/no-extraneous-dependencies': 'off',
            },
        },
        {
            // сборочные скрипты выполняет node, и это обычный commonjs
            files: ['scripts/**/*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
        {
            // Внутри файла один css-литерал со стилями всей панели. Резать его по счётчику
            // строк нечего: получатся куски, которые всё равно склеиваются обратно
            files: ['src/ui/styles.ts'],
            rules: {
                'max-lines': 'off',
            },
        },
    ],
};
