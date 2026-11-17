/** @type {import('jest').Config} */
module.exports = {
    testRegex: String.raw`.*\.spec\.ts$`,
    moduleNameMapper: {
        '\\.css$': '<rootDir>/validate-build/style-mock.js',
    },
    transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest'),
    },
};
