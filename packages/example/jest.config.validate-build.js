/** @type {import('jest').Config} */
module.exports = {
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.tsx?$': ['@swc/jest', { jsc: { target: 'es2022' } }],
    },
};
