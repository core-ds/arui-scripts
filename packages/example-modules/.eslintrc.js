module.exports = {
    root: true,
    extends: [require.resolve('arui-presets-lint/eslint')],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    settings: {
        react: {
            version: '18.0.0',
        },
    },
    rules: {
        // это тестовый проект и ему позволительно писать в консоль
        'no-console': 'off',
    },
};
