module.exports = {
    root: true,
    extends: ['custom/common'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    rules: {
        // это тестовый проект и ему позволительно писать в консоль
        'no-console': 'off',
    },
};
