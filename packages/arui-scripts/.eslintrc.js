module.exports = {
    root: true,
    extends: [require.resolve('arui-presets-lint/eslint')],
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.eslint.json'],
    },
    ignorePatterns: ['./src/templates/dockerfile-compiled.template.ts', '.turbo'],
    rules: {
        // чтобы могли использовать for и генераторы
        'no-restricted-syntax': 'off',
        // проект - cli-тулза, и она должна писать в консоль
        'no-console': 'off',
        'import/no-cycle': 'off', // TODO: 7 ошибок, возможно их можно убрать
        'no-restricted-imports': 'off', // TODO: 5 ошибок с импортом lodash.merge. Убрать отдельным пр
    },
};
