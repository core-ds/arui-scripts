import path from 'path';

import fs from 'fs-extra';

import { generateArtifacts } from './artifacts';
import { type BaselineIssue, createComment } from './comment';
import { getSizes } from './sizes';
import { type Bundle, IncompatibleSnapshotError, readSnapshot } from './snapshot';

export type BundleDiffOptions = {
    current: string;
    baseline?: string;
    output: string;
    reportUrl?: string;
    currentLabel?: string;
    baselineLabel?: string;
};

type Baseline = { bundles?: Bundle[]; issue?: BaselineIssue };

// Отсутствующий или несовместимый baseline не мешает показать текущие размеры.
async function readBaseline(directory?: string): Promise<Baseline> {
    if (!directory || !(await fs.pathExists(path.join(directory, 'index.json')))) {
        return { issue: 'missing' };
    }

    try {
        return { bundles: await readSnapshot(directory) };
    } catch (error) {
        if (!(error instanceof IncompatibleSnapshotError)) {
            throw error;
        }

        console.warn(error.message);

        return { issue: 'incompatible' };
    }
}

export async function generateBundleDiff(options: BundleDiffOptions): Promise<void> {
    const current = await readSnapshot(options.current);
    const baseline = await readBaseline(options.baseline);
    const output = path.resolve(options.output);
    const currentSizes = getSizes(current);
    const baselineSizes = baseline.bundles ? getSizes(baseline.bundles) : undefined;

    const comparisons = await generateArtifacts(current, baseline.bundles, output);
    const comment = createComment({
        current: currentSizes,
        baseline: baselineSizes,
        baselineIssue: baseline.issue,
        comparisons,
        reportUrl: options.reportUrl,
        currentLabel: options.currentLabel,
        baselineLabel: options.baselineLabel,
    });

    await fs.writeFile(path.join(output, 'comment.md'), comment, 'utf8');
    await fs.writeJson(
        path.join(output, 'summary.json'),
        { current: currentSizes, baseline: baselineSizes || null },
        { spaces: 2 },
    );
}
