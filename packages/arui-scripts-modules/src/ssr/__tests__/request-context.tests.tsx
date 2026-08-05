import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { render } from '@testing-library/react';

import {
    ModuleSsrRequestProvider,
    type ModuleSsrRequest,
    useModuleSsrRequestContext,
} from '../request-context';

function Probe({ onContext }: { onContext: (request: ModuleSsrRequest) => void }) {
    onContext(useModuleSsrRequestContext());

    return null;
}

describe('ModuleSsrRequestProvider', () => {
    // createRoot.render() в React 18 может проглотить ошибку рендера в console.error,
    // поэтому проверяем throw через renderToStaticMarkup (он пробрасывает синхронно).
    it('throws when used without a provider', () => {
        expect(() => renderToStaticMarkup(<Probe onContext={() => {}} />)).toThrow(
            /ModuleSsrRequestProvider/,
        );
    });

    it('provides the requestId and a per-request cache Map', () => {
        let captured: ModuleSsrRequest | undefined;

        render(
            <ModuleSsrRequestProvider requestId='r1'>
                <Probe
                    onContext={(request) => {
                        captured = request;
                    }}
                />
            </ModuleSsrRequestProvider>,
        );

        expect(captured?.requestId).toBe('r1');
        expect(captured?.cache).toBeInstanceOf(Map);
    });

    it('resets the cache when the requestId changes', () => {
        const caches: Array<Map<string, unknown>> = [];

        const { rerender } = render(
            <ModuleSsrRequestProvider requestId='r1'>
                <Probe onContext={(request) => caches.push(request.cache)} />
            </ModuleSsrRequestProvider>,
        );

        rerender(
            <ModuleSsrRequestProvider requestId='r2'>
                <Probe onContext={(request) => caches.push(request.cache)} />
            </ModuleSsrRequestProvider>,
        );

        expect(caches[0]).not.toBe(caches[1]);
    });
});
