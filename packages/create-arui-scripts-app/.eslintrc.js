module.exports = {
    root: true,
    extends: [require.resolve('arui-presets-lint/eslint')],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    rules: {
        // CLI пишет в консоль
        'no-console': 'off',
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
