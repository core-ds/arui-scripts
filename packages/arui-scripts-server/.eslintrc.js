module.exports = {
    root: true,
    extends: ['custom/common'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    rules: {
        'no-underscore-dangle': 'off',
        '@typescript-eslint/naming-convention': 'off',
        'no-console': 'off',
    },
};
