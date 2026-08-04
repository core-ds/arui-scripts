import { type DevtoolsEvent } from '../contract';
import { createEventsView } from '../ui/events-view';

function createEvent(overrides: Partial<DevtoolsEvent> = {}): DevtoolsEvent {
    return {
        id: 1,
        type: 'load-start',
        loadId: 'load-1',
        moduleId: 'module',
        timestamp: performance.timeOrigin + 1,
        time: 100,
        ...overrides,
    };
}

function getRows(element: HTMLElement) {
    return Array.from(element.querySelectorAll('.row_event:not(.row_header)'));
}

function getToolbar(element: HTMLElement) {
    return {
        search: element.querySelector('.search') as HTMLInputElement,
        errorsOnly: element.querySelector('.checkbox__input') as HTMLInputElement,
        counter: element.querySelector('.toolbar__counter') as HTMLElement,
    };
}

describe('createEventsView', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('should show a placeholder when there are no events', () => {
        const view = createEventsView();

        view.update([]);

        expect(view.element.textContent).toContain('События ещё не записывались');
    });

    it('should render events freshest first', () => {
        const view = createEventsView();

        view.update([
            createEvent({ id: 1, moduleId: 'first' }),
            createEvent({ id: 2, moduleId: 'second' }),
        ]);

        const rows = getRows(view.element);

        expect(rows).toHaveLength(2);
        expect(rows[0].textContent).toContain('second');
        expect(rows[1].textContent).toContain('first');
    });

    it('should render the event fields', () => {
        const view = createEventsView();

        view.update([
            createEvent({
                type: 'stage-end',
                stage: 'fetch-manifest',
                message: 'что-то случилось',
                time: 1500,
            }),
        ]);

        const row = getRows(view.element)[0];

        expect(row.textContent).toContain('1.50 с');
        expect(row.textContent).toContain('stage-end');
        expect(row.textContent).toContain('fetch-manifest');
        expect(row.textContent).toContain('что-то случилось');
    });

    it('should not show a page-relative time for events of the previous page load', () => {
        const view = createEventsView();

        view.update([createEvent({ timestamp: performance.timeOrigin - 1000, time: 300 })]);

        // время считается от начала загрузки страницы, а у прошлой загрузки было своё начало
        expect(getRows(view.element)[0].textContent).not.toContain('300 мс');
    });

    it('should mark error events', () => {
        const view = createEventsView();

        view.update([createEvent({ type: 'error', message: 'Boom' })]);

        expect(getRows(view.element)[0].classList.contains('row_error')).toBe(true);
    });

    it('should filter by module, type and message', () => {
        const view = createEventsView();
        const { search, counter } = getToolbar(view.element);

        view.update([
            createEvent({ id: 1, moduleId: 'alpha' }),
            createEvent({ id: 2, moduleId: 'beta', type: 'unmount' }),
            createEvent({ id: 3, moduleId: 'gamma', message: 'alpha упал' }),
        ]);

        search.value = 'alpha';
        search.dispatchEvent(new Event('input'));

        expect(getRows(view.element)).toHaveLength(2);
        expect(counter.textContent).toBe('показано 2 из 3');

        search.value = 'unmount';
        search.dispatchEvent(new Event('input'));

        expect(getRows(view.element)).toHaveLength(1);
    });

    it('should tell when the filter found nothing', () => {
        const view = createEventsView();
        const { search } = getToolbar(view.element);

        view.update([createEvent()]);
        search.value = 'ничего такого';
        search.dispatchEvent(new Event('input'));

        expect(view.element.textContent).toContain('Ничего не нашлось');
    });

    it('should toggle the errors-only filter', () => {
        const view = createEventsView();

        // jsdom не считает клик по неприсоединённому чекбоксу активацией и не шлёт change,
        // а в браузере панель всегда в документе
        document.body.appendChild(view.element);

        const { errorsOnly } = getToolbar(view.element);

        view.update([createEvent({ id: 1 }), createEvent({ id: 2, type: 'error' })]);

        errorsOnly.click();

        expect(getRows(view.element)).toHaveLength(1);
        expect(errorsOnly.checked).toBe(true);

        errorsOnly.click();

        expect(getRows(view.element)).toHaveLength(2);
        expect(errorsOnly.checked).toBe(false);
    });

    it('should label the errors-only checkbox', () => {
        const view = createEventsView();
        const { errorsOnly } = getToolbar(view.element);
        const label = errorsOnly.closest('label');

        // подпись должна быть частью label: клик по тексту обязан переключать фильтр,
        // а скринридер - называть чекбокс
        expect(label?.textContent).toContain('Только ошибки');
        expect(errorsOnly.type).toBe('checkbox');
    });

    it('should keep the filter when new events arrive', () => {
        const view = createEventsView();
        const { search } = getToolbar(view.element);

        view.update([createEvent({ id: 1, moduleId: 'alpha' })]);
        search.value = 'alpha';
        search.dispatchEvent(new Event('input'));

        view.update([
            createEvent({ id: 1, moduleId: 'alpha' }),
            createEvent({ id: 2, moduleId: 'beta' }),
        ]);

        expect(getRows(view.element)).toHaveLength(1);
    });
});
