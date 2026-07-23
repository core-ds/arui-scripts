import { getEventBus } from '../get-event-bus';
import { createBus } from '../implementation';

describe('browser environment guards', () => {
    const originalWindow = global.window;

    beforeEach(() => {
        Object.defineProperty(window, '__alfa_event_buses', {
            configurable: true,
            value: {},
            writable: true,
        });
    });

    afterEach(() => {
        Object.defineProperty(global, 'window', {
            configurable: true,
            value: originalWindow,
        });
    });

    it('returns null when reading a bus outside the browser', () => {
        Object.defineProperty(global, 'window', {
            configurable: true,
            value: undefined,
        });

        expect(getEventBus('test')).toBeNull();
    });

    it('returns an existing bus from the global registry', () => {
        const eventBus = createBus('test');

        expect(getEventBus('test')).toBe(eventBus);
    });

    it('returns undefined when the requested bus has not been created', () => {
        expect(getEventBus('missing')).toBeUndefined();
    });

    it('throws a descriptive error when creating a bus outside the browser', () => {
        Object.defineProperty(global, 'window', {
            configurable: true,
            value: undefined,
        });

        expect(() => createBus('test')).toThrow(
            'Client event bus can only be created in a browser environment',
        );
    });
});
