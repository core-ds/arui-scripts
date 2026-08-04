import { PANEL_STATE_KEY, readPanelState, writePanelState } from '../panel-state';

describe('panel-state', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('should be closed by default', () => {
        expect(readPanelState()).toEqual({ open: false, tab: undefined });
    });

    it('should remember that the panel was open', () => {
        writePanelState({ open: true });

        expect(readPanelState().open).toBe(true);
    });

    it('should remember the active tab without losing the open flag', () => {
        writePanelState({ open: true });
        writePanelState({ tab: 'events' });

        expect(readPanelState()).toEqual({ open: true, tab: 'events' });
    });

    it('should survive garbage in the storage', () => {
        sessionStorage.setItem(PANEL_STATE_KEY, 'not a json');

        expect(readPanelState()).toEqual({ open: false });
    });

    it('should ignore values of unexpected types', () => {
        sessionStorage.setItem(PANEL_STATE_KEY, JSON.stringify({ open: 'yes', tab: 42 }));

        expect(readPanelState()).toEqual({ open: false, tab: undefined });
    });

    it('should not throw when the storage refuses to write', () => {
        const setItem = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota exceeded');
        });

        expect(() => writePanelState({ open: true })).not.toThrow();

        setItem.mockRestore();
    });
});
