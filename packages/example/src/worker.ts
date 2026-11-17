// TODO: remove eslint-disable
/* eslint-disable no-console */

// This code executes in its own worker or thread
self.addEventListener('install', () => {
    console.log('Service worker installed');
});
self.addEventListener('activate', () => {
    console.log('Service worker activated');
});
