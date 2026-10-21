/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
    transform: {
        '^.+\\.tsx?$': ['@swc/jest', { jsc: { target: 'es2016' } }],
    },
};
