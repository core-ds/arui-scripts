import { DEFAULT_PANEL_STATE, PANEL_STATE_KEY } from '../constants';
import { type PanelState } from '../types';

function getStorage(): Storage | undefined {
    try {
        // в приватных режимах некоторых браузеров обращение к sessionStorage кидает
        return typeof sessionStorage === 'undefined' ? undefined : sessionStorage;
    } catch {
        return undefined;
    }
}

export function readPanelState(): PanelState {
    const storage = getStorage();

    if (!storage) {
        return DEFAULT_PANEL_STATE;
    }

    try {
        const raw = storage.getItem(PANEL_STATE_KEY);

        if (!raw) {
            return DEFAULT_PANEL_STATE;
        }

        const parsed = JSON.parse(raw) as Partial<PanelState>;

        return {
            open: parsed?.open === true,
            tab: typeof parsed?.tab === 'string' ? parsed.tab : undefined,
            history: typeof parsed?.history === 'boolean' ? parsed.history : undefined,
        };
    } catch {
        // мусор в хранилище не должен мешать панели открыться
        return DEFAULT_PANEL_STATE;
    }
}

export function writePanelState(patch: Partial<PanelState>): void {
    const storage = getStorage();

    if (!storage) {
        return;
    }

    try {
        storage.setItem(PANEL_STATE_KEY, JSON.stringify({ ...readPanelState(), ...patch }));
    } catch {
        // квота или запрет на запись - панель просто не вспомнит себя, это не повод падать
    }
}
