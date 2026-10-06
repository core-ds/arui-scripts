import { type BundleDiffOptions, generateBundleDiff } from './report';

export async function run(options: BundleDiffOptions): Promise<void> {
    try {
        await generateBundleDiff(options);

        console.log(`Rsdoctor bundle diff written to ${options.output}`);
    } catch (error) {
        console.error('Rsdoctor bundle diff failed:', error);

        process.exitCode = 1;
    }
}
