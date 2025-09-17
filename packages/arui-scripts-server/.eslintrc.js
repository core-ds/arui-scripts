module.exports = {
    root: true,
    extends: [require.resolve('arui-presets-lint/eslint')],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
};
