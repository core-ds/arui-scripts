/**
 * @jest-environment node
 */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { createLazyMounter } from '../create-lazy-mounter';

describe('createLazyMounter (server)', () => {
    it('should not run the loader on the server', async () => {
        const loader = jest.fn();

        const factory = createLazyMounter({ loader });

        await factory();

        expect(loader).not.toHaveBeenCalled();
    });

    it('should render an empty outlet that is safe to render on the server', async () => {
        const loader = jest.fn();

        const factory = createLazyMounter({ loader });
        const { default: Component } = await factory();

        expect(renderToStaticMarkup(<Component />)).toBe('<div></div>');
    });
});
