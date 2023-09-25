// TODO: remove eslint-disable and eslint-disable-next-line
/* eslint-disable @typescript-eslint/no-var-requires */
// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const jestRunner = require('jest');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const jestConfig = require('../../configs/jest');

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', (err) => {
    // eslint-disable-next-line @typescript-eslint/no-throw-literal
    throw err;
});

// Skip 'node', 'arui-scripts' and 'test' arguments and take all the rest (or none if there is no more arguments).
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const argv = process.argv.slice(3);

argv.push('--config', JSON.stringify(jestConfig));

jestRunner.run(argv);
