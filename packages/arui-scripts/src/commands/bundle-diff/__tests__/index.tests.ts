import { generateBundleDiff } from '../report';
import { run } from '..';

jest.mock('../report', () => ({ generateBundleDiff: jest.fn() }));

const options = { current: 'rsdoctor/current', output: 'rsdoctor/diff' };
let exitCode: typeof process.exitCode;

beforeEach(() => {
    exitCode = process.exitCode;
    process.exitCode = undefined;

    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.mocked(generateBundleDiff).mockResolvedValue(undefined);
});

afterEach(() => {
    process.exitCode = exitCode;
    jest.restoreAllMocks();
    jest.clearAllMocks();
});

it('passes options to the generator and reports successful completion', async () => {
    await run(options);

    expect(generateBundleDiff).toHaveBeenCalledWith(options);
    expect(console.log).toHaveBeenCalledWith('Rsdoctor bundle diff written to rsdoctor/diff');
    expect(console.error).not.toHaveBeenCalled();
    expect(process.exitCode).toBeUndefined();
});

it('sets a nonzero exit code and logs the original generation error', async () => {
    const error = new Error('Snapshot is missing');

    jest.mocked(generateBundleDiff).mockRejectedValueOnce(error);

    await run(options);

    expect(console.error).toHaveBeenCalledWith('Rsdoctor bundle diff failed:', error);
    expect(console.log).not.toHaveBeenCalled();
    expect(process.exitCode).toBe(1);
});
