/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    // фикстуры лежат рядом с тестами и сами тестами не являются
    testMatch: ['**/__tests__/**/*.test.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
};
