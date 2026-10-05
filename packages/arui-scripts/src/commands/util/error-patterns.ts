import { type ErrorCategory, type ErrorSuggestion } from './error-types';

const MISSING_EXPORT_PATTERN =
    /(?:export ['"]([^'"]+)['"](?: \(imported as ['"][^'"]+['"]\))? was not found|['"]([^'"]+)['"] is not (?:exported|defined))/i;

export const DOCS_BASE_URL = 'https://github.com/core-ds/arui-scripts/issues';

export interface ErrorPattern {
    pattern: RegExp;
    category: ErrorCategory;
    getSuggestions: (error: WebpackErrorLike) => ErrorSuggestion[];
}

export interface WebpackErrorLike {
    message: string;
    stack?: string;
    loc?: string;
    moduleName?: string;
    file?: string;
}

function extractMissingModuleName(message: string): string {
    const patterns = [
        /cannot find (?:module|file) ['"`]([^'"`\n]+)['"`]/i,
        /cannot find (?:module|file) (\S+)/i,
        /(?:can't|cannot) resolve ['"`]([^'"`]+)['"`]/i,
        /(?:can't|cannot) resolve (\S+)/i,
        /module not found:\s*(?:error:\s*)?(?:can't resolve\s+)?['"`]([^'"`]+)['"`]/i,
    ];

    for (const pattern of patterns) {
        const match = pattern.exec(message);

        if (match?.[1]) {
            return match[1];
        }
    }

    return '';
}

function getSuggestionsForModuleNotFound(moduleName: string): ErrorSuggestion[] {
    const isLocalPath = /^(?:\.|\/|\\|[a-z]:[\\/])/i.test(moduleName);
    const isAlias = /^(?:@\/|~\/|#)/.test(moduleName);
    // A subpath identifies a file within a package, not a package to install.
    const packageName = moduleName.match(
        /^(@[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*|[a-z0-9][a-z0-9._-]*)(?:\/[^\s]*)?$/i,
    )?.[1];
    const suggestions: ErrorSuggestion[] = [];

    if (isAlias) {
        suggestions.push({
            type: 'config',
            message:
                'Check tsconfig.json paths, resolve.alias or package.json imports configuration',
        });
    } else if (isLocalPath) {
        suggestions.push({
            type: 'typo',
            message: 'Check that the file path is correct',
        });
    } else if (packageName) {
        suggestions.push({
            type: 'install',
            message: 'Check if the package is installed',
            command: `npm ls ${packageName}`,
        });
        suggestions.push({
            type: 'install',
            message: 'Install the package',
            command: `npm install ${packageName}`,
        });
    } else {
        suggestions.push({
            type: 'typo',
            message: 'Check that the module path or package name is correct',
        });
    }

    suggestions.push({
        type: 'general',
        message: `See module resolution issues: ${DOCS_BASE_URL}`,
    });

    return suggestions;
}

export const ERROR_PATTERNS: ErrorPattern[] = [
    // TS-коды раньше module: иначе TS2307 уйдёт в module с советом npm install
    {
        // Коды TS бывают 4-5-значными (TS2307, TS18048)
        pattern: /\bTS\d{4,5}\b:/,
        category: 'typescript',
        getSuggestions: () => [
            {
                type: 'config',
                message: 'Run type checking for details',
                command: 'npx tsc --noEmit',
            },
            {
                type: 'general',
                message: `See TypeScript issues: ${DOCS_BASE_URL}`,
            },
        ],
    },
    // MF раньше module: иначе "Remote module not found" матчит общий module-паттерн
    {
        pattern: /remote module.*not found|cannot find remote/i,
        category: 'module-federation',
        getSuggestions: () => [
            {
                type: 'config',
                message: 'Check remoteEntry.js is accessible',
            },
            {
                type: 'config',
                message: 'Run build on remote application first',
            },
            {
                type: 'general',
                message: `See Module Federation issues: ${DOCS_BASE_URL}`,
            },
        ],
    },
    {
        pattern: /remote container.*not available/i,
        category: 'module-federation',
        getSuggestions: () => [
            {
                type: 'config',
                message: 'Check remote application is running',
            },
            {
                type: 'config',
                message: 'Verify shared dependencies configuration',
            },
        ],
    },
    {
        pattern:
            /cannot find (?:module|file)|(?<!remote )module not found|can't resolve|cannot resolve/i,
        category: 'module',
        getSuggestions: (error) =>
            getSuggestionsForModuleNotFound(extractMissingModuleName(error.message)),
    },
    {
        pattern: MISSING_EXPORT_PATTERN,
        category: 'module',
        getSuggestions: (error) => {
            const match = error.message.match(MISSING_EXPORT_PATTERN);
            const exportName = match?.[1] || match?.[2] || '';
            const suggestions: ErrorSuggestion[] = [];

            if (exportName) {
                suggestions.push({
                    type: 'typo',
                    message: `Check for typos in import: "${exportName}"`,
                });
                suggestions.push({
                    type: 'typo',
                    message: 'Verify export exists in source module',
                });
            }

            suggestions.push({
                type: 'general',
                message: `See export issues: ${DOCS_BASE_URL}`,
            });

            return suggestions;
        },
    },
    {
        pattern: /element type is invalid/i,
        category: 'runtime',
        getSuggestions: () => [
            {
                type: 'syntax',
                message: 'Check component import is a valid React component',
            },
            {
                type: 'typo',
                message: 'Ensure default export is used correctly',
            },
            {
                type: 'general',
                message: `See React import issues: ${DOCS_BASE_URL}`,
            },
        ],
    },
    {
        pattern: /Cannot read propert(?:y|ies) ['"]([^'"]+)['"]/,
        category: 'runtime',
        getSuggestions: (error) => [
            {
                type: 'syntax',
                message: `Check that property "${
                    error.message.match(/['"]([^'"]+)['"]/)?.[1]
                }" exists`,
            },
            {
                type: 'config',
                message: 'Verify component receives correct props',
            },
        ],
    },
    {
        pattern: /unknown word/i,
        category: 'css',
        getSuggestions: () => [
            {
                type: 'syntax',
                message: 'Check CSS syntax for errors',
            },
            {
                type: 'config',
                message: 'Ensure proper CSS parser is configured',
            },
            {
                type: 'general',
                message: `See CSS issues: ${DOCS_BASE_URL}`,
            },
        ],
    },
    {
        pattern: /\bSyntaxError\b|JavaScript parse error|TypeScript parse error/i,
        category: 'syntax',
        getSuggestions: () => [
            {
                type: 'syntax',
                message: 'Check JavaScript/TypeScript syntax',
            },
            {
                type: 'syntax',
                message: 'Ensure all brackets and parentheses are closed',
            },
        ],
    },
    {
        pattern: /parsing error/i,
        category: 'syntax',
        getSuggestions: () => [
            {
                type: 'syntax',
                message: 'Check JavaScript/TypeScript syntax',
            },
            {
                type: 'syntax',
                message: 'Ensure all brackets and parentheses are closed',
            },
        ],
    },
    {
        pattern: /heap out of memory/i,
        category: 'configuration',
        getSuggestions: () => [
            {
                type: 'config',
                message: 'Increase Node.js memory limit',
                command: 'NODE_OPTIONS=--max-old-space-size=4096',
            },
            {
                type: 'general',
                message: `See memory issues: ${DOCS_BASE_URL}`,
            },
        ],
    },
    {
        pattern: /configuration for target ["'][^"']+["'] not supported/i,
        category: 'configuration',
        getSuggestions: () => [
            {
                type: 'config',
                message: 'Check rspack/webpack target configuration',
            },
            {
                type: 'config',
                message: 'Update to compatible Node.js version',
            },
        ],
    },
];

export function findErrorPattern(error: WebpackErrorLike): ErrorPattern | undefined {
    const isStyleFile = /\.(?:css|scss|sass|less)(?:\?|$)/i.test(
        error.moduleName || error.file || '',
    );
    const isStyleDiagnostic = /CssSyntaxError|(?:css|postcss|sass|less)-loader/i.test(
        error.message,
    );

    if (
        (isStyleFile || isStyleDiagnostic) &&
        /SyntaxError|unclosed|unknown word/i.test(error.message)
    ) {
        return ERROR_PATTERNS.find(({ category }) => category === 'css');
    }

    return ERROR_PATTERNS.find(({ pattern }) => pattern.test(error.message));
}
