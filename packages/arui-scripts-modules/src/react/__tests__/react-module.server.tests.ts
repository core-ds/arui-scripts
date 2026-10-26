/** @jest-environment node */

import { createReactModule } from '..';

describe('React-хелпер в серверном окружении', () => {
    it('импортируется и создаёт адаптер без обращения к DOM', () => {
        expect(typeof document).toBe('undefined');
        const module = createReactModule({ Component: () => null });

        expect(module.mount).toBeInstanceOf(Function);
        expect(module.hydrate).toBeInstanceOf(Function);
        expect(module.update).toBeInstanceOf(Function);
        expect(module.unmount).toBeInstanceOf(Function);
    });
});
