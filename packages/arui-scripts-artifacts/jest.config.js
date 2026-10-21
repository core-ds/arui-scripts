/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    // фикстуры лежат рядом с тестами и сами тестами не являются
    testMatch: ['**/__tests__/**/*.test.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
    transform: {
        '^.+\\.tsx?$': ['@swc/jest', { jsc: { target: 'es2022' } }],
    },
};
