// jsdom не предоставляет TextEncoder/TextDecoder, которые нужны react-dom/server.
const { TextEncoder, TextDecoder } = require('node:util');

if (global.TextEncoder === undefined) {
    global.TextEncoder = TextEncoder;
}

if (global.TextDecoder === undefined) {
    global.TextDecoder = TextDecoder;
}

// jsdom-окружение не пробрасывает setImmediate/clearImmediate, которые нужны react-dom/server.node.
if (global.setImmediate === undefined) {
    global.setImmediate = (fn, ...args) => setTimeout(() => fn(...args), 0);
}

if (global.clearImmediate === undefined) {
    global.clearImmediate = (id) => clearTimeout(id);
}
