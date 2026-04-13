import { runVitest } from '../util/run-vitest';

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'test';
process.env.PUBLIC_URL = '';

const args = process.argv.slice(3);
runVitest({ args })
    .then((code) => {
        process.exit(code);
    })
    .catch((error) => {
        console.error('Error running Vitest:', error);
        process.exit(1);
    });
