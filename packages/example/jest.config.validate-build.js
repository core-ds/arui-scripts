/** @type {import('jest').Config} */
module.exports = {
    testRegex: String.raw`.*\.spec\.ts$`,
    transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest'),
    },
};
