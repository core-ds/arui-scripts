const VERSION = /^\d+\.\d+\.\d+$/;

export function parseMatrix(workflow) {
    // This repository deliberately keeps the version matrix as flat, inline YAML mappings.
    // Fail closed when its format changes instead of partially updating a new matrix layout.
    const block = workflow.match(/\bversions:\s*\[([^\]]+)\]/)?.[1];

    if (!block) {
        throw new Error('Cannot find the inline Node.js version matrix.');
    }

    const rows = [...block.matchAll(/\{([^{}]+)\}/g)].map(([source, fields]) => {
        const row = Object.fromEntries(
            [...fields.matchAll(/(\w+):\s*(?:'([^']+)'|"([^"]+)"|([\w.-]+))/g)].map(
                ([, key, single, double, bare]) => [key, single ?? double ?? bare],
            ),
        );

        if (!VERSION.test(row.node) || !/^\d+\.\d+$/.test(row.alpine) || row.image !== 'node') {
            throw new Error(`Unsupported Node.js matrix row: ${source}`);
        }

        const suffix = row.dockerfile === 'Dockerfile-slim' ? '-slim' : '';

        if (
            !['Dockerfile', 'Dockerfile-slim'].includes(row.dockerfile) ||
            row.tag !== `${row.node}${suffix}`
        ) {
            throw new Error(`Inconsistent Dockerfile/tag in matrix row: ${source}`);
        }

        return row;
    });

    if (!rows.length || block.replace(/\{[^{}]+\}/g, '').replace(/[\s,]/g, '') !== '') {
        throw new Error('Unsupported Node.js matrix format.');
    }

    const majors = new Map();

    for (const row of rows) {
        const major = row.node.split('.')[0];
        const existing = majors.get(major);

        if (!existing) {
            majors.set(major, { ...row, variants: new Set([row.dockerfile]) });
        } else {
            if (
                existing.node !== row.node ||
                existing.alpine !== row.alpine ||
                existing.variants.has(row.dockerfile)
            ) {
                throw new Error(`Inconsistent matrix rows for Node.js ${major}.`);
            }

            existing.variants.add(row.dockerfile);
        }
    }

    for (const [major, row] of majors) {
        if (row.variants.size !== 2) {
            throw new Error(`Missing full/slim matrix pair for Node.js ${major}.`);
        }
    }

    return [...majors.values()];
}
