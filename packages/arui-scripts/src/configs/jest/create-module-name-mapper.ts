/** Converts tsconfig aliases to Jest mappings without a TypeScript compiler API dependency. */
export function createModuleNameMapper(
    paths: Record<string, string[]>,
): Record<string, string | string[]> {
    const mappings: Record<string, string | string[]> = {};
    const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    Object.entries(paths).forEach(([alias, targets]) => {
        const segments = alias.split('*');

        if (targets.length === 0 || segments.length > 2) {
            return;
        }

        const pattern = `^${segments.map(escapeRegex).join('(.*)')}$`;
        const replacements = targets.map((target) => {
            const relative = target.replace(/^\.\//, '');

            return `<rootDir>/${segments.length === 2 ? relative.replace(/\*/g, '$1') : relative}`;
        });

        mappings[pattern] = replacements.length === 1 ? replacements[0] : replacements;
    });

    return mappings;
}
