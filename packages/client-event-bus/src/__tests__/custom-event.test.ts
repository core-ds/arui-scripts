type CustomEventModule = {
    CustomEvent: typeof global.CustomEvent;
};

describe('CustomEvent fallback', () => {
    const NativeCustomEvent = global.CustomEvent;

    afterEach(() => {
        Object.defineProperty(global, 'CustomEvent', {
            configurable: true,
            value: NativeCustomEvent,
        });
        jest.resetModules();
    });

    it('creates an event when the native constructor is unavailable', () => {
        Object.defineProperty(global, 'CustomEvent', {
            configurable: true,
            value: class UnsupportedCustomEvent {
                constructor() {
                    throw new Error('CustomEvent is unavailable');
                }
            },
        });
        jest.resetModules();

        // eslint-disable-next-line @typescript-eslint/no-var-requires,global-require
        const { CustomEvent } = require('../custom-event') as CustomEventModule;
        const event = new CustomEvent('test', { detail: 'value' });

        expect(event.type).toBe('test');
        expect(event.detail).toBe('value');
    });
});
