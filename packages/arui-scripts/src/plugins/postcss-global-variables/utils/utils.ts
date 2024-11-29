import fs from 'fs';
import path from 'path';

import { AtRule, Declaration, Helpers, Root, Rule } from 'postcss';

export const getMediaQueryName = (rule: AtRule) => rule.params.split(' ')[0];

export function parseImport(root: Root, postcssHelpers: Helpers, filePath: string) {
    let resolvedPath = '';

    try {
        resolvedPath = path.resolve(filePath);
    } catch (err) {
        throw new Error(`Failed to read ${filePath} with error ${(err instanceof Error) ? err.message : err}`);
    }

    postcssHelpers.result.messages.push({
        type: 'dependency',
        plugin: 'postcss-global-environments',
        file: resolvedPath,
        parent: root.source?.input?.file,
    });

    const fileContents = fs.readFileSync(resolvedPath, 'utf8');

    return postcssHelpers.postcss.parse(fileContents, { from: resolvedPath });
}

export const parseVariables = (importedFile: Root, parsedVariables: Record<string, string>) => {
    importedFile.walkDecls((decl) => {
        // eslint-disable-next-line no-param-reassign
        parsedVariables[decl.prop] = decl.value;
    });
};

export const parseMediaQuery = (importedFile: Root, parsedCustomMedia: Record<string, AtRule>) => {
    importedFile.walkAtRules('custom-media', (mediaRule) => {
        const mediaName = getMediaQueryName(mediaRule);

        // eslint-disable-next-line no-param-reassign
        parsedCustomMedia[mediaName] = mediaRule;
    });
};

export function addGlobalVariable(cssValue: string, rootSelector: Rule, parsedVariables: Record<string, string>) {
    const variableMatches = cssValue.match(/var\(--([^)]+)\)/g);

    if (variableMatches) {
        variableMatches.forEach((match) => {
            // var(--gap-24) => --gap-24
            const variableName = match.slice(4, -1);

            if (parsedVariables[variableName]) {
                rootSelector.append(new Declaration({ prop: variableName, value: parsedVariables[variableName] }));

                // Рекурсивно проходимся по значениям css, там тоже могут использоваться переменные
                addGlobalVariable(parsedVariables[variableName], rootSelector, parsedVariables);
            }
        });
    }
}

export const insertParsedCss = (root: Root, parsedVariables: Record<string, string>, parsedCustomMedia: Record<string, AtRule>): Rule => {
    const rootRule = new Rule({ selector: ':root' });

    root.walkDecls((decl) => {
        addGlobalVariable(decl.value, rootRule, parsedVariables);
    });

    root.walkAtRules('media', (rule) => {
        const mediaFullName = getMediaQueryName(rule);

        if (mediaFullName.startsWith('(--')) {
            const mediaName = mediaFullName.slice(1, -1);

            if (parsedCustomMedia[mediaName]) {
                root.append(parsedCustomMedia[mediaName]);
            }
        }
    });

    return rootRule;
};
