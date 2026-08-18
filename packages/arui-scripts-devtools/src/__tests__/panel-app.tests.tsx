import { fireEvent, render } from '@testing-library/react';

import { PANEL_STATE_KEY } from '../constants';
import { PanelApp } from '../panel/panel-app';
import { type DevtoolsSnapshot, type DevtoolsState, type ModuleLoadRecord } from '../types';

/** начало отсчёта инспектируемой страницы: панель узнаёт его из снимка, своего у неё нет */
const PAGE_ORIGIN = 1_700_000_000_000;

function createRecord(loadId: string, moduleId: string, startedAt: number): ModuleLoadRecord {
    return {
        loadId,
        moduleId,
        hostAppId: 'host',
        status: 'loaded',
        shareScope: 'default',
        fromCache: false,
        scripts: [],
        styles: [],
        timings: { 'fetch-manifest': { start: 0, end: 10 } },
        startedAt,
    };
}

const SNAPSHOT: DevtoolsSnapshot = {
    version: 1,
    shareScopes: [],
    sharedRequirements: {},
    loads: [
        createRecord('page0-1', 'before-reload', PAGE_ORIGIN - 1000),
        createRecord('page1-1', 'after-reload', PAGE_ORIGIN + 1),
    ],
    events: [],
};

function createSource(state: DevtoolsState) {
    return { getInitialState: () => state, subscribe: () => () => undefined };
}

function renderPanel() {
    return render(
        <PanelApp
            source={createSource({
                modules: { status: 'ready', snapshot: SNAPSHOT },
                eventBus: { status: 'waiting' },
                page: { timeOrigin: PAGE_ORIGIN },
            })}
        />,
    );
}

function getHistoryToggle(container: HTMLElement) {
    return container.querySelector('.header .checkbox__input') as HTMLInputElement;
}

describe('PanelApp', () => {
    beforeEach(() => {
        sessionStorage.clear();
    });

    it('should show the history of previous page loads by default', () => {
        // модуль, упавший на старте, ищут уже после перезагрузки: без истории
        // от записи о падении остаётся только память
        const { container } = renderPanel();

        expect(getHistoryToggle(container).checked).toBe(true);
        expect(container.textContent).toContain('before-reload');
        expect(container.textContent).toContain('after-reload');
    });

    it('should hide the previous page loads when the history is off', () => {
        const { container } = renderPanel();

        fireEvent.click(getHistoryToggle(container));

        expect(container.textContent).not.toContain('before-reload');
        expect(container.textContent).toContain('after-reload');
        expect(container.querySelector('.row_separator')).toBeNull();
    });

    it('should remember the choice for the next opening', () => {
        const { container, unmount } = renderPanel();

        fireEvent.click(getHistoryToggle(container));
        unmount();

        expect(JSON.parse(sessionStorage.getItem(PANEL_STATE_KEY) as string).history).toBe(false);
        expect(getHistoryToggle(renderPanel().container).checked).toBe(false);
    });

    it('should not offer the history where it means nothing', () => {
        // подмена адресов и события шины к загрузкам страницы отношения не имеют
        const { container } = renderPanel();

        fireEvent.click(
            Array.from(container.querySelectorAll('.tab')).find(
                (tab) => tab.textContent === 'Подмена',
            ) as HTMLElement,
        );

        expect(getHistoryToggle(container)).toBeNull();
    });
});
