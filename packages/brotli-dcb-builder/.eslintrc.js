module.exports = {
    root: true,
    extends: ['custom/common'],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    rules: {
        'no-console': 'off', // консольная утилита может писать в консоль
    }
};