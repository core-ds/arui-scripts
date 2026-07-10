/** @type {import('jest').Config} */
module.exports = {
    testRegex: '.*\\.spec\\.ts$',
    moduleNameMapper: {
        '\\.css$': '<rootDir>/validate-build/style-mock.js',
    },
    transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest'),
    },
};
