module.exports = {
    root: true,
    extends: ['custom/common'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: [
            './tsconfig.eslint.json',
        ],
    },
    overrides: [
        {
            files: ['**/__tests__/**/*.{ts,tsx}'],
            rules: {
                'import/no-extraneous-dependencies': 'off',
            },
        }
    ],
};
