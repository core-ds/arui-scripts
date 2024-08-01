import path from 'path';

// eslint-disable-next-line import/no-extraneous-dependencies
import loaderUtils from 'loader-utils';

import { configs } from '../app-configs';

// повторяет поведение react-dev-utils/getCSSModuleLocalIdent
export function getCssModuleLocalIndent(name: string, filename: string) {
    const fileNameOrFolder = filename.match(
        /index\.module\.(css|scss|sass)$/
    )
        ? getFolderName(filename)
        : getFileNameWithoutExtension(filename.replace(/\.module\.(css|scss|sass)$/, '.css'));

    const hash = loaderUtils.getHashDigest(
        `${path.posix.relative(configs.cwd, filename)}${name}` as unknown as Buffer,
        'md5',
        'base64',
        5
    ).replace(/\//g, '-');

    return `${fileNameOrFolder}_${name}__${hash}`;
}

function getFolderName(filename: string) {
    return path.basename(path.dirname(filename));
}

function getFileNameWithoutExtension(filename: string) {
    return path.parse(filename).name;
}
