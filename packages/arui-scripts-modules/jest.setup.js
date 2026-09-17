/* eslint-disable @typescript-eslint/no-var-requires, global-require */
// jsdom не предоставляет TextEncoder/TextDecoder, которые нужны react-dom/server.
const { TextEncoder, TextDecoder } = require('util');

if (typeof global.TextEncoder === 'undefined') {
    global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
    global.TextDecoder = TextDecoder;
}

// jsdom-окружение не пробрасывает setImmediate/clearImmediate, которые нужны react-dom/server.node.
if (typeof global.setImmediate === 'undefined') {
    global.setImmediate = (fn, ...args) => setTimeout(() => fn(...args), 0);
}

if (typeof global.clearImmediate === 'undefined') {
    global.clearImmediate = (id) => clearTimeout(id);
}
