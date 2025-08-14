import fs from 'fs';
import path from 'path';

import CompressionPlugin from 'compression-webpack-plugin';

import { configs } from '../app-configs';

import { compressWithDcb } from './compress-with-dcb';
import { CustomCompressionPlugin } from './dcb-compression-plugin';

export function compressionPluginsForDictionaries() {
    const predefinedPlugins = configs.compressionPredefinedDictionaryPath.map((dictionaryPath) => {
        const dictionaryName = path.parse(dictionaryPath).name;
        const dictionaryContent = fs.readFileSync(dictionaryPath, null);

        return new CompressionPlugin({
            test: /\.js$|\.css$/,
            filename: `[file].${dictionaryName}.dcb`,
            algorithm: (input, options, callback) => {
                compressWithDcb(input, dictionaryContent)
                    .then((r) => callback(null, r));
            },
            threshold: 10240,
            minRatio: 0.8,
        })
    });

    const prevVersionPlugins = configs.compressionPreviousVersionPath.map((dictionaryPath) => {
        const dictionaries = fs.readdirSync(dictionaryPath);

        const parsedDictionaries = dictionaries.reduce(
            (map, current) => {
                const parsed = parseFilename(current);

                return ({
                    ...map,
                    [`${parsed.stableName}.${parsed.ext}`]: parsed,
                });
            },
            {} as Record<string, ReturnType<typeof parseFilename>>,
        );

        return new CustomCompressionPlugin({
            test: /\.js$|\.css$/,
            threshold: 10240,
            minRatio: 0.8,
            filename: (pathData) => {
                const parsedFilename = parseFilename(pathData.filename || '');
                const matchedDictionary = parsedDictionaries[`${parsedFilename.stableName}.${parsedFilename.ext}`];

                if (!matchedDictionary) {
                    return ''
                }

                return `${parsedFilename.filename}.${matchedDictionary.hash}.dcb`
            },
            algorithm: async (input, { filename }) => {
                const parsedFilename = parseFilename(filename);
                const matchedDictionary = parsedDictionaries[`${parsedFilename.stableName}.${parsedFilename.ext}`];

                if (!matchedDictionary) {
                    return input;
                }

                try {
                    const dictionaryContent = fs.readFileSync(path.join(dictionaryPath, matchedDictionary.filename), null);

                    return await compressWithDcb(input, dictionaryContent);
                } catch (e) {
                    return input;
                }
            }
        });
    });

    return [
        ...predefinedPlugins,
        ...prevVersionPlugins,
    ];
}

function parseFilename(filename: string) {
    const parsedName = path.parse(filename);
    const [stableName, hash] = parsedName.name.split('.');

    return {
        stableName,
        hash,
        ext: parsedName.ext.substring(1),
        filename,
    };
}
