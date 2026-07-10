import { getDefaultInstanceId } from '../instance-id';

describe('getDefaultInstanceId', () => {
    it('is deterministic for equal params', () => {
        expect(getDefaultInstanceId({ name: 'Vasia', counter: 1 })).toBe(
            getDefaultInstanceId({ name: 'Vasia', counter: 1 }),
        );
    });

    it('ignores key order', () => {
        expect(getDefaultInstanceId({ a: 1, b: 2 })).toBe(getDefaultInstanceId({ b: 2, a: 1 }));
    });

    it('differs for different params', () => {
        expect(getDefaultInstanceId({ name: 'Vasia' })).not.toBe(
            getDefaultInstanceId({ name: 'Petya' }),
        );
    });

    it('handles undefined', () => {
        expect(typeof getDefaultInstanceId(undefined)).toBe('string');
        expect(getDefaultInstanceId(undefined)).toBe(getDefaultInstanceId(undefined));
    });
});
