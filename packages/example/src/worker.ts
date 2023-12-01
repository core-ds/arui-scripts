globalThis.addEventListener('install', () => {
    console.log('Service worker installed');
});
globalThis.addEventListener('activate', () => {
    console.log('Service worker activated');
});
