// ignore attempts to require any types of assets
(() => {
    // simply ignore css files, it wont cause any damage
    const ignoreExtensions = ['.css'];
    // warn about other requires, because it may lead to unexpected behaviour in production
    const warnExtensions = [
        '.gif',
        '.jpeg',
        '.jpg',
        '.ico',
        '.png',
        '.xml',
        '.svg',
        '.mp4',
        '.webm',
        '.ogv',
        '.aac',
        '.mp3',
        '.wav',
        '.ogg',
    ];
    const noop = () => {};
    const warn = (_, path) =>
        console.warn(`\u001B[0;31mWARNING!
    Trying to require ${path} in node.js.
    Non-js files is ignored when required in node_modules\u001B[0m`);

    ignoreExtensions.forEach((e) => {
        require.extensions[e] = noop;
    });
    warnExtensions.forEach((e) => {
        require.extensions[e] = warn;
    });
})();
