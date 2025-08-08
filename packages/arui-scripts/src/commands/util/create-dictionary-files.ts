import { configs } from '../../configs/app-configs';

import { dcbFromBundle } from './brotli-dictionary/dcb-from-bundle';
import { dcbFromPredefined } from './brotli-dictionary/dcb-from-predefined';
import { dcbFromPreviousVersion } from './brotli-dictionary/dcb-from-previous-version';

export async function createDictionaryFiles() {
    await dcbFromPreviousVersion();

    const { singleDictionaryMode } = configs.dictionaryCompression;

    console.log('dictionary mode:', singleDictionaryMode);

    if (singleDictionaryMode === 'disabled') {
        return;
    }

    if (singleDictionaryMode === 'predefined') {
        if (!configs.dictionaryCompression.predefinedDictionaryPath) {
            console.warn('predefinedDictionaryPath is not set, but versionDictionaryMode is "predefined"');

            return;
        }
        await dcbFromPredefined();
    }

    if (singleDictionaryMode === 'default') {
        await dcbFromBundle();
    }
}
