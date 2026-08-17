module.exports = {
    root: true,
    extends: [require.resolve('arui-presets-lint/eslint')],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    rules: {
        // имена свободных переменных задаёт бандлер, переименовать их мы не можем
        'no-underscore-dangle': [
            'error',
            { allow: ['__webpack_share_scopes__', '__webpack_init_sharing__'] },
        ],
    },
    overrides: [
        {
            files: ['**/__tests__/**/*.{ts,tsx}'],
            rules: {
                'import/no-extraneous-dependencies': 'off',
            },
        },
    ],
};
