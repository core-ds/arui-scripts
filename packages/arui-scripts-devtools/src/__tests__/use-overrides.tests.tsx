import { act, render } from '@testing-library/react';

import { OVERRIDES_STORAGE_KEY } from '../constants';
import { applyOverrides, type Override, readActiveOverrides } from '../extension/overrides';
import { useOverrides } from '../panel/use-overrides';

jest.mock('../extension/overrides', () => ({
    ...jest.requireActual('../extension/overrides'),
    applyOverrides: jest.fn(() => Promise.resolve()),
    readActiveOverrides: jest.fn(() => Promise.resolve([])),
}));

const STORED: Override = { from: 'http://localhost:8082', to: 'http://localhost:8085' };

let current: [Override[], (next: Override[]) => void];

function Harness() {
    current = useOverrides();

    return null;
}

async function renderHarness() {
    const result = render(<Harness />);

    // сверка с браузером асинхронная: ждём её, иначе проверяем состояние до ответа
    await act(async () => undefined);

    return result;
}

describe('useOverrides', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('should start with what the panel remembers', () => {
        localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify([STORED]));
        // ответ браузера не приходит вовсе: смотрим ровно на первый кадр
        jest.mocked(readActiveOverrides).mockReturnValue(
            new Promise(() => {
                /* никогда не резолвится */
            }),
        );

        render(<Harness />);

        expect(current[0]).toEqual([STORED]);
    });

    it('should drop a rule the browser no longer has', async () => {
        // правила живут в сессии браузера: перезапуск Chrome их снимает. Список из хранилища
        // после этого показывал бы включённой подмену, которой давно нет
        localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify([STORED]));
        jest.mocked(readActiveOverrides).mockResolvedValue([]);

        await renderHarness();

        expect(current[0]).toEqual([]);
        expect(localStorage.getItem(OVERRIDES_STORAGE_KEY)).toBe('[]');
    });

    it('should never re-arm a forgotten rule on its own', async () => {
        localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify([STORED]));
        jest.mocked(readActiveOverrides).mockResolvedValue([]);

        await renderHarness();

        expect(applyOverrides).not.toHaveBeenCalled();
    });

    it('should show a rule the browser has but the panel forgot', async () => {
        // призрак с той стороны: хранилище почистили, а перехват остался. Увидеть его
        // важнее всего - иначе модуль грузится не оттуда без единого следа в интерфейсе
        jest.mocked(readActiveOverrides).mockResolvedValue([STORED]);

        await renderHarness();

        expect(current[0]).toEqual([STORED]);
    });

    it('should keep the stored list when there is nobody to ask', async () => {
        // вне расширения `getSessionRules` недоступен: «не знаю» - не повод стирать список
        localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify([STORED]));
        jest.mocked(readActiveOverrides).mockResolvedValue(undefined);

        await renderHarness();

        expect(current[0]).toEqual([STORED]);
    });

    it('should apply, remember and publish a new set', async () => {
        await renderHarness();

        act(() => current[1]([STORED]));

        expect(applyOverrides).toHaveBeenCalledWith([STORED]);
        expect(JSON.parse(localStorage.getItem(OVERRIDES_STORAGE_KEY) as string)).toEqual([STORED]);
        expect(current[0]).toEqual([STORED]);
    });

    it('should not touch the state after unmount', async () => {
        let resolve: (value: Override[]) => void = () => undefined;

        jest.mocked(readActiveOverrides).mockReturnValue(
            new Promise((done) => {
                resolve = done;
            }),
        );

        const { unmount } = render(<Harness />);

        unmount();

        // ответ пришёл к уже закрытой панели - обновлять нечего
        await act(async () => resolve([STORED]));

        expect(localStorage.getItem(OVERRIDES_STORAGE_KEY)).toBeNull();
    });
});
