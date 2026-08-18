import { fireEvent, render, waitFor } from '@testing-library/react';

import { applyOverrides } from '../extension/overrides';
import { OverridesView } from '../panel/overrides-view';

jest.mock('../extension/overrides', () => {
    const actual = jest.requireActual('../extension/overrides');

    return {
        ...actual,
        applyOverrides: jest.fn(() => Promise.resolve()),
        hasOriginPermission: jest.fn(() => Promise.resolve(true)),
        requestOriginPermission: jest.fn(() => Promise.resolve(true)),
    };
});

const ORIGIN = 'http://localhost:8082';

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
        localStorage.clear();
        jest.clearAllMocks();
    });

    it('should say there is nothing to redirect yet', () => {
        const { container } = render(<OverridesView origins={[]} />);

        expect(container.textContent).toContain('Подменять пока нечего');
    });

    it('should not redirect anything while the address is being typed', async () => {
        // до починки правило вставало по мере набора: адрес начинал перехватываться
        // на середине слова, и пользователь узнавал об этом по сломавшейся странице
        const { container } = render(<OverridesView origins={[ORIGIN]} />);

        fireEvent.change(getInput(container), { target: { value: 'http://localhost:8085' } });

        expect(applyOverrides).toHaveBeenCalledTimes(1);
        expect(jest.mocked(applyOverrides).mock.calls[0][0]).toEqual([]);
    });

    it('should redirect only after the button is pressed', async () => {
        const { container } = render(<OverridesView origins={[ORIGIN]} />);

        fireEvent.change(getInput(container), { target: { value: 'http://localhost:8085' } });
        fireEvent.click(getButton(container, 'Включить'));

        // клик асинхронный: сначала спрашиваем разрешение на origin
        await waitFor(() =>
            expect(jest.mocked(applyOverrides).mock.lastCall?.[0]).toEqual([
                { from: ORIGIN, to: 'http://localhost:8085' },
            ]),
        );
    });

    it('should mark an origin that is actually redirected', async () => {
        localStorage.setItem(
            'arui:devtools:overrides',
            JSON.stringify([{ from: ORIGIN, to: 'http://localhost:8085' }]),
        );

        const { container } = render(<OverridesView origins={[ORIGIN]} />);

        expect(container.querySelector('.badge_active')?.textContent).toBe('включена');
        expect(getInput(container).value).toBe('http://localhost:8085');
    });

    it('should not offer to apply a rule that is already applied', () => {
        localStorage.setItem(
            'arui:devtools:overrides',
            JSON.stringify([{ from: ORIGIN, to: 'http://localhost:8085' }]),
        );

        const { container } = render(<OverridesView origins={[ORIGIN]} />);

        expect(getButton(container, 'Обновить').disabled).toBe(true);
    });

    it('should refuse a target that is not an origin', () => {
        const { container } = render(<OverridesView origins={[ORIGIN]} />);

        fireEvent.change(getInput(container), { target: { value: 'localhost:8085' } });

        expect(getButton(container, 'Включить').disabled).toBe(true);
    });

    it('should drop the rule and clear the field on remove', async () => {
        localStorage.setItem(
            'arui:devtools:overrides',
            JSON.stringify([{ from: ORIGIN, to: 'http://localhost:8085' }]),
        );

        const { container } = render(<OverridesView origins={[ORIGIN]} />);

        fireEvent.click(container.querySelector('.button_icon') as HTMLButtonElement);

        expect(jest.mocked(applyOverrides).mock.lastCall?.[0]).toEqual([]);
        expect(getInput(container).value).toBe('');
        expect(container.querySelector('.badge_active')).toBeNull();
    });
});
