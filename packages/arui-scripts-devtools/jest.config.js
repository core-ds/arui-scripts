/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
    // свой transform перекрывает пресетовский целиком, поэтому ts-jest здесь повторён
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
        '\\.css$': '<rootDir>/scripts/jest-css-transform.js',
    },
    collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/index.ts'],
};
