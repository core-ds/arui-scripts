import { useState } from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';

import { type Override } from '../extension/overrides';
import { OverridesView } from '../panel/overrides-view';

jest.mock('../extension/overrides', () => ({
    ...jest.requireActual('../extension/overrides'),
    hasOriginPermission: jest.fn(() => Promise.resolve(true)),
    requestOriginPermission: jest.fn(() => Promise.resolve(true)),
}));

const ORIGIN = 'http://localhost:8082';

const changes: Override[][] = [];

/** набор подмен держит панель - в тестах её роль играет эта обёртка */
function OverridesHarness({
    origins = [ORIGIN],
    initial = [],
}: {
    origins?: string[];
    initial?: Override[];
}) {
    const [overrides, setOverrides] = useState<Override[]>(initial);

    return (
        <OverridesView
            origins={origins}
            overrides={overrides}
            onChange={(next) => {
                changes.push(next);
                setOverrides(next);
            }}
        />
    );
}

function getInput(container: HTMLElement) {
    return container.querySelector('.overrides__to') as HTMLInputElement;
}

function getButton(container: HTMLElement, text: string) {
    return Array.from(container.querySelectorAll('button')).find(
        (button) => button.textContent === text,
    ) as HTMLButtonElement;
}

describe('OverridesView', () => {
    beforeEach(() => {
        changes.length = 0;
        jest.clearAllMocks();
    });

    it('should say there is nothing to redirect yet', () => {
        const { container } = render(<OverridesHarness origins={[]} />);

        expect(container.textContent).toContain('Подменять пока нечего');
    });

    it('should not redirect anything while the address is being typed', () => {
        // до починки правило вставало по мере набора: адрес начинал перехватываться
        // на середине слова, и пользователь узнавал об этом по сломавшейся странице
        const { container } = render(<OverridesHarness />);

        fireEvent.change(getInput(container), { target: { value: 'http://localhost:8085' } });

        expect(changes).toEqual([]);
    });

    it('should redirect only after the button is pressed', async () => {
        const { container } = render(<OverridesHarness />);

        fireEvent.change(getInput(container), { target: { value: 'http://localhost:8085' } });
        fireEvent.click(getButton(container, 'Включить'));

        // клик асинхронный: сначала спрашиваем разрешение на origin
        await waitFor(() =>
            expect(changes).toEqual([[{ from: ORIGIN, to: 'http://localhost:8085' }]]),
        );
    });

    it('should mark an origin that is actually redirected', () => {
        const { container } = render(
            <OverridesHarness initial={[{ from: ORIGIN, to: 'http://localhost:8085' }]} />,
        );

        expect(container.querySelector('.badge_active')?.textContent).toBe('включена');
        expect(getInput(container).value).toBe('http://localhost:8085');
    });

    it('should not offer to apply a rule that is already applied', () => {
        const { container } = render(
            <OverridesHarness initial={[{ from: ORIGIN, to: 'http://localhost:8085' }]} />,
        );

        expect(getButton(container, 'Обновить').disabled).toBe(true);
    });

    it('should refuse a target that is not an origin', () => {
        const { container } = render(<OverridesHarness />);

        fireEvent.change(getInput(container), { target: { value: 'localhost:8085' } });

        expect(getButton(container, 'Включить').disabled).toBe(true);
    });

    it('should drop the rule and clear the field on remove', () => {
        const { container } = render(
            <OverridesHarness initial={[{ from: ORIGIN, to: 'http://localhost:8085' }]} />,
        );

        fireEvent.click(container.querySelector('.button_icon') as HTMLButtonElement);

        expect(changes).toEqual([[]]);
        expect(getInput(container).value).toBe('');
        expect(container.querySelector('.badge_active')).toBeNull();
    });

    it('should keep the other rules when one is changed', async () => {
        const other = { from: 'http://localhost:8083', to: 'http://localhost:8086' };
        const { container } = render(
            <OverridesHarness origins={[ORIGIN, other.from]} initial={[other]} />,
        );

        fireEvent.change(getInput(container), { target: { value: 'http://localhost:8085' } });
        fireEvent.click(getButton(container, 'Включить'));

        await waitFor(() =>
            expect(changes[0]).toEqual([other, { from: ORIGIN, to: 'http://localhost:8085' }]),
        );
    });
});
