import { type AruiAppManifest } from '../types';

import { createNetworkError, createParseError, createResponseError } from './request-error';

const ERROR_DESCRIPTION = 'App manifest request';

export function fetchAppManifest(url: string) {
    return new Promise<AruiAppManifest>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.onload = () => {
            if (xhr.status !== 200) {
                reject(createResponseError(ERROR_DESCRIPTION, url, xhr));

                return;
            }

            try {
                resolve(JSON.parse(xhr.responseText));
            } catch (error) {
                reject(createParseError(ERROR_DESCRIPTION, url, error));
            }
        };
        xhr.onerror = () => reject(createNetworkError(ERROR_DESCRIPTION, url));
        xhr.send();
    });
}
