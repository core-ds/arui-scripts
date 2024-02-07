module.exports = {
    root: true,
    extends: ['custom/common'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json', './validate-build/tsconfig.json'],
    },
    rules: {
        'import/no-extraneous-dependencies': 'off',
        'no-console': 'off',
        'no-restricted-syntax': 'off',
    },
};
