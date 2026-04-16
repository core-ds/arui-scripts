import crypto from 'crypto';
import path from 'path';

interface CssLoaderContext {
    resourcePath: string;
    rootContext: string;
}

export function getLocalIdent(
    context: CssLoaderContext,
    _localIdentName: string,
    localName: string,
): string {
    const isIndexModule = /index\.module\.(css|scss|sass)$/.test(context.resourcePath);

    const relativePath = path.posix.relative(context.rootContext, context.resourcePath);

    const hash = crypto
        .createHash('md5')
        .update(relativePath + localName)
        .digest('base64')
        .slice(0, 5)
        .replace(/\+/g, '_')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    let baseName: string;

    if (isIndexModule) {
        baseName = path.basename(path.dirname(context.resourcePath));
    } else {
        baseName = path.basename(context.resourcePath, '.module.css');
    }

    const className = `${baseName}_${localName}__${hash}`;

    return className.replace('.module_', '_').replace(/\./g, '_');
}
