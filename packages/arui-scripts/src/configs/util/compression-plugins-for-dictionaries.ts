import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

import { configs } from '../app-configs';

import { compressWithDcb } from './compress-with-dcb';
import { CustomCompressionPlugin } from './dcb-compression-plugin';

// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const dictionaryCompressorVersion: string = require('brotli-dict/package.json').version;

function prepareDictionary(dictionaryContent: Buffer) {
    return {
        key: JSON.stringify([
            dictionaryCompressorVersion,
            compressWithDcb.toString(),
            crypto.createHash('sha256').update(dictionaryContent).digest('hex'),
        ]),
        compress: (input: Buffer) => compressWithDcb(input, dictionaryContent),
    };
}

export function compressionPluginsForDictionaries() {
    const predefinedPlugins = configs.compressionPredefinedDictionaryPath.map((dictionaryPath) => {
        const dictionaryName = path.parse(dictionaryPath).name;

        return new CustomCompressionPlugin({
            test: /\.js$|\.css$/,
            filename: ({ filename }) => `${filename}.${dictionaryName}.dcb`,
            fileDependencies: [dictionaryPath],
            prepare: () => prepareDictionary(fs.readFileSync(dictionaryPath)),
            threshold: 10240,
            minRatio: 0.8,
        });
    });

    const prevVersionPlugins = configs.compressionPreviousVersionPath.map((dictionaryPath) => {
        const dictionaries = fs.readdirSync(dictionaryPath);

        const parsedDictionaries = dictionaries.reduce((map, current) => {
            const parsed = parseFilename(current);

            return {
                ...map,
                [`${parsed.stableName}.${parsed.ext}`]: parsed,
            };
        }, {} as Record<string, ReturnType<typeof parseFilename>>);

        return new CustomCompressionPlugin({
            test: /\.js$|\.css$/,
            threshold: 10240,
            minRatio: 0.8,
            filename: (pathData) => {
                const parsedFilename = parseFilename(pathData.filename || '');
                const matchedDictionary =
                    parsedDictionaries[`${parsedFilename.stableName}.${parsedFilename.ext}`];

                if (!matchedDictionary) {
                    return '';
                }

                return `${parsedFilename.filename}.${matchedDictionary.hash}.dcb`;
            },
            fileDependencies: dictionaries.map((file) => path.join(dictionaryPath, file)),
            prepare: (filename) => {
                const parsed = parseFilename(filename);
                const matched = parsedDictionaries[`${parsed.stableName}.${parsed.ext}`];

                if (!matched) return { key: 'missing', compress: async (input) => input };

                try {
                    const dictionaryContent = fs.readFileSync(
                        path.join(dictionaryPath, matched.filename),
                        null,
                    );

                    return prepareDictionary(dictionaryContent);
                } catch (e) {
                    return { key: 'missing', compress: async (input) => input };
                }
            },
        });
    });

    return [...predefinedPlugins, ...prevVersionPlugins];
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
