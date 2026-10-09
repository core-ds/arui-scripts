/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
    maxWorkers: '25%',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: ['/node_modules/', '/build/'],
};
