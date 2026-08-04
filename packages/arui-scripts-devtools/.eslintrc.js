module.exports = {
    root: true,
    // jsx-runtime поверх пресета: пакет собирается с automatic-рантаймом JSX,
    // и `import React` в каждом файле пресету требовать не нужно
    extends: [require.resolve('arui-presets-lint/eslint'), 'plugin:react/jsx-runtime'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    settings: {
        // react в пакете — приватная копия из devDependencies, `detect` пресета
        // нашёл бы hoisted-версию соседей
        react: { version: '19.0.0' },
    },
    rules: {
        // имя свободной переменной задаёт webpack, переименовать её мы не можем
        'no-underscore-dangle': ['error', { allow: ['__webpack_share_scopes__'] }],
    },
    overrides: [
        {
            // react и react-dom намеренно в devDependencies: они бандлятся в чанк панели
            // приватной копией и не должны становиться зависимостью потребителя
            files: ['src/**/*.{ts,tsx}'],
            rules: {
                'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
            },
        },
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
            files: ['src/panel/styles.ts'],
            rules: {
                'max-lines': 'off',
            },
        },
    ],
};
