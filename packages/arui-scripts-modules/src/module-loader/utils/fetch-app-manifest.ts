import { urlSegmentWithoutEndSlash } from './normalize-url-segment';
import { AruiAppManifest } from '../types';

export function fetchAppManifest(baseUrl: string) {
    return new Promise<AruiAppManifest>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${urlSegmentWithoutEndSlash(baseUrl)}/assets/webpack-assets.json`, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(JSON.parse(xhr.responseText));
            } else {
                reject(new Error(xhr.statusText));
            }
        };
        xhr.onerror = () => reject(new Error(xhr.statusText));
        xhr.send();
    });
}
