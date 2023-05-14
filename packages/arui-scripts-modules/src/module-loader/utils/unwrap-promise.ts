import type { AsyncPreload, SyncPreload } from '../types';

export const unwrapMaybePromise = async <T, A>(
    fn: SyncPreload<A, T> | AsyncPreload<A, T> | undefined,
    args: A,
    defaultValue: T,
) => {
    let result = defaultValue;
    const maybePromise = fn?.(args);

    if (maybePromise instanceof Promise) {
        result = await maybePromise;
    } else if (maybePromise) {
        result = maybePromise;
    }

    return result;
};
