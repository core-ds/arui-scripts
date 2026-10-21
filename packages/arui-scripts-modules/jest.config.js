/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'jsdom',
    setupFiles: ['<rootDir>/jest.setup.js'],
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'],
    transform: {
        '^.+\\.tsx?$': ['@swc/jest', { jsc: { target: 'es2016' } }],
    },
};
