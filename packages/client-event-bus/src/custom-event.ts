// CustomEvent не поддерживается нормально в ie, поэтому полифилим его прям тут
function isNativeCustomEventAvailable() {
    try {
        const p = new global.CustomEvent('cat', { detail: { foo: 'bar' } });

        return p.type === 'cat' && p.detail.foo === 'bar';
    } catch (e) {
        // just ignore it
    }

    return false;
}

function CustomEventPolyfill<T>(type: string, params: CustomEventInit<T>) {
    const e = document.createEvent('CustomEvent');

    if (params) {
        e.initCustomEvent(type, Boolean(params.bubbles), Boolean(params.cancelable), params.detail);
    } else {
        e.initCustomEvent(type, false, false, undefined);
    }

    return e;
}

export const CustomEvent = (
    isNativeCustomEventAvailable() ? global.CustomEvent : CustomEventPolyfill
) as unknown as typeof global.CustomEvent;
