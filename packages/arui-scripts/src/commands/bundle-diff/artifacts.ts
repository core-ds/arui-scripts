import path from 'path';

import { execute } from '@rsdoctor/cli';
import fs from 'fs-extra';

import { type Bundle } from './snapshot';

export type BundleComparison =
    | { name: string; status: 'added' }
    | { name: string; status: 'removed' }
    | { name: string; status: 'compared'; htmlFile: string };

async function generateReport(current: string, baseline: string, output: string, index: number) {
    const htmlFile = `client-${index}.html`;
    const htmlPath = path.join(output, htmlFile);

    await execute('bundle-diff', {
        baseline,
        current,
        html: true,
        open: false,
        output: htmlPath,
    });

    if (!(await fs.pathExists(htmlPath))) {
        throw new Error(`Rsdoctor did not generate ${htmlFile}`);
    }

    await execute('bundle-diff', {
        baseline,
        current,
        json: path.join(output, `client-${index}.json`),
    });

    return htmlFile;
}

export async function generateArtifacts(
    current: Bundle[],
    baseline: Bundle[] | undefined,
    output: string,
): Promise<BundleComparison[]> {
    await fs.ensureDir(output);

    const oldFiles = (await fs.readdir(output)).filter(
        (file) =>
            /^client-\d+\.(html|json)$/.test(file) || ['comment.md', 'summary.json'].includes(file),
    );

    await Promise.all(oldFiles.map((file) => fs.remove(path.join(output, file))));

    if (baseline === undefined) {
        return [];
    }

    const comparisons: BundleComparison[] = [];
    const currentNames = new Set(current.map(({ name }) => name));

    for (const [index, bundle] of current.entries()) {
        const previous = baseline.find(({ name }) => name === bundle.name);

        if (previous === undefined) {
            comparisons.push({ name: bundle.name, status: 'added' });
        } else {
            // eslint-disable-next-line no-await-in-loop
            const htmlFile = await generateReport(bundle.file, previous.file, output, index);

            comparisons.push({ name: bundle.name, status: 'compared', htmlFile });
        }
    }

    baseline.forEach(({ name }) => {
        if (!currentNames.has(name)) {
            comparisons.push({ name, status: 'removed' });
        }
    });

    return comparisons;
}
