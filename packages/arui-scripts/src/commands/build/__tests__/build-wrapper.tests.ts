import build from '../build-wrapper';

const mockRun = jest.fn();
const mockClose = jest.fn();

jest.mock('../../util/create-compiler', () => ({
    createCompiler: () => ({ run: mockRun, close: mockClose }),
}));

const stats = { toJson: jest.fn(() => ({ errors: [], warnings: [] })) };

beforeEach(() => {
    jest.clearAllMocks();
    mockRun.mockImplementation((callback) => callback(null, stats));
    mockClose.mockImplementation((callback) => callback());
    stats.toJson.mockReturnValue({ errors: [], warnings: [] });
});

it('consumes native statistics before closing and waits for cache flush', async () => {
    const order: string[] = [];
    let finishClose: () => void = () => {};

    mockClose.mockImplementation((callback) => {
        order.push('close');
        finishClose = callback;
    });
    const pending = build({}, async (result) => {
        expect(result.stats).toBe(stats);
        order.push('statistics');
    });

    await new Promise(setImmediate);
    expect(order).toEqual(['statistics', 'close']);
    finishClose();
    await expect(pending).resolves.toEqual({ warnings: [] });
});

it('closes the compiler after a native compilation error', async () => {
    mockRun.mockImplementation((callback) => callback(new Error('compile failed')));
    await expect(build({})).rejects.toThrow('compile failed');
    expect(mockClose).toHaveBeenCalledTimes(1);
});

it('closes the compiler when output validation rejects', async () => {
    await expect(
        build({}, async () => {
            throw new Error('budget exceeded');
        }),
    ).rejects.toThrow('budget exceeded');
    expect(mockClose).toHaveBeenCalledTimes(1);
});

it('rejects an unsuccessful cache flush', async () => {
    mockClose.mockImplementation((callback) => callback(new Error('flush failed')));
    await expect(build({})).rejects.toThrow('flush failed');
});

it('preserves the original error when closing also fails', async () => {
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});

    mockRun.mockImplementation((callback) => callback(new Error('compile failed')));
    mockClose.mockImplementation((callback) => callback(new Error('flush failed')));
    await expect(build({})).rejects.toThrow('compile failed');
    expect(log).toHaveBeenCalled();
    log.mockRestore();
});

it('closes the compiler when statistics are unavailable', async () => {
    mockRun.mockImplementation((callback) => callback(null, undefined));
    await expect(build({})).rejects.toThrow('statistics');
    expect(mockClose).toHaveBeenCalledTimes(1);
});
