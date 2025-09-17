/** @type {import('jest').Config} */
module.exports = {
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.tsx?$': require.resolve('ts-jest'),
    },
};
