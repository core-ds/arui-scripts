/**
 * Ключ, под которым панель помнит саму себя.
 *
 * Именно sessionStorage: панель открывают, чтобы разобраться с конкретной страницей, и после
 * перезагрузки она должна остаться открытой в этой вкладке - но не всплывать во всех остальных.
 */
export const PANEL_STATE_KEY = 'arui:devtools:panel';

export type PanelState = {
    /** панель была открыта в момент ухода со страницы */
    open: boolean;
    /** id последней активной вкладки */
    tab?: string;
};

const DEFAULT_STATE: PanelState = { open: false };

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
        return DEFAULT_STATE;
    }

    try {
        const raw = storage.getItem(PANEL_STATE_KEY);

        if (!raw) {
            return DEFAULT_STATE;
        }

        const parsed = JSON.parse(raw) as Partial<PanelState>;

        return {
            open: parsed?.open === true,
            tab: typeof parsed?.tab === 'string' ? parsed.tab : undefined,
        };
    } catch {
        // мусор в хранилище не должен мешать панели открыться
        return DEFAULT_STATE;
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
