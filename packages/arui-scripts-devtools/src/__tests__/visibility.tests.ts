import { PANEL_BRIDGE_KEY } from '../constants';
import { createPanelVisibility } from '../extension/visibility';

type Bridge = { setVisible(visible: boolean): void };

describe('panel visibility', () => {
    let bridge: Bridge;
    let visibility: ReturnType<typeof createPanelVisibility>;

    beforeEach(() => {
        const target: Record<string, unknown> = {};

        visibility = createPanelVisibility();
        visibility.install(target);
        bridge = target[PANEL_BRIDGE_KEY] as Bridge;
    });

    it('should consider the panel visible until told otherwise', () => {
        // документ панели создаётся в момент первого показа, и `onShown` вполне может
        // прийти раньше, чем мост встанет на место
        expect(visibility.isVisible()).toBe(true);
    });

    it('should tell subscribers when the tab is hidden and shown again', () => {
        const seen: boolean[] = [];

        visibility.subscribe((visible) => seen.push(visible));

        bridge.setVisible(false);
        bridge.setVisible(true);

        expect(seen).toEqual([false, true]);
        expect(visibility.isVisible()).toBe(true);
    });

    it('should stay quiet when nothing changed', () => {
        const seen: boolean[] = [];

        visibility.subscribe((visible) => seen.push(visible));

        bridge.setVisible(true);
        bridge.setVisible(false);
        bridge.setVisible(false);

        expect(seen).toEqual([false]);
    });

    it('should stop telling an unsubscribed listener', () => {
        const seen: boolean[] = [];
        const unsubscribe = visibility.subscribe((visible) => seen.push(visible));

        unsubscribe();
        bridge.setVisible(false);

        expect(seen).toEqual([]);
    });

    it('should not let one listener break the others', () => {
        const seen: boolean[] = [];

        visibility.subscribe(() => {
            throw new Error('всё пропало');
        });
        visibility.subscribe((visible) => seen.push(visible));

        bridge.setVisible(false);

        expect(seen).toEqual([false]);
    });

    it('should survive a target that refuses new properties', () => {
        const frozen = Object.freeze({});

        expect(() => createPanelVisibility().install(frozen)).not.toThrow();
    });
});
