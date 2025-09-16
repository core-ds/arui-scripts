module.exports = {
    root: true,
    extends: [require.resolve('arui-presets-lint/eslint')],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json', './validate-build/tsconfig.json'],
    },
    settings: {
        react: {
            version: '17.0.0',
        },
    },
};
