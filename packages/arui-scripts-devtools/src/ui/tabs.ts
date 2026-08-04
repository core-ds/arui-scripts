import { createElement } from './dom';

export type TabDefinition = {
    id: string;
    title: string;
    content: HTMLElement;
    /** зовётся при каждом переключении на вкладку: момент, когда стоит пересобрать данные */
    onShow?(): void;
};

export type Tabs = {
    /** полоска с кнопками вкладок */
    header: HTMLElement;
    /** контейнер с содержимым активной вкладки */
    body: HTMLElement;
    /** дописывает пометку к заголовку вкладки, например число найденных проблем */
    setNote(id: string, note: string): void;
    /** открыта ли сейчас эта вкладка. Нужно тем, кто обновляет содержимое только на виду */
    isActive(id: string): boolean;
};

export type CreateTabsOptions = {
    /** какую вкладку открыть сразу. Неизвестный id игнорируется - откроется первая */
    activeId?: string;
    onChange?(id: string): void;
};

export function createTabs(definitions: TabDefinition[], options: CreateTabsOptions = {}): Tabs {
    const header = createElement('div', 'tabs');
    const body = createElement('div', 'body');
    const buttons = new Map<string, HTMLButtonElement>();
    const notes = new Map<string, string>();

    const restored = definitions.find((tab) => tab.id === options.activeId);

    let activeId = restored?.id ?? definitions[0]?.id;

    function renderTitles() {
        definitions.forEach((tab) => {
            const note = notes.get(tab.id);
            const button = buttons.get(tab.id);

            if (button) {
                button.textContent = note ? `${tab.title} · ${note}` : tab.title;
            }
        });
    }

    function activate(id: string) {
        activeId = id;
        body.textContent = '';

        definitions.forEach((tab) => {
            buttons.get(tab.id)?.classList.toggle('tab_active', tab.id === id);
            buttons.get(tab.id)?.setAttribute('aria-selected', String(tab.id === id));
        });

        const active = definitions.find((tab) => tab.id === id);

        if (active) {
            active.onShow?.();
            body.appendChild(active.content);
        }
    }

    definitions.forEach((tab) => {
        const button = createElement('button', 'tab', tab.title);

        button.type = 'button';
        button.setAttribute('role', 'tab');
        button.addEventListener('click', () => {
            if (tab.id !== activeId) {
                activate(tab.id);
                options.onChange?.(tab.id);
            }
        });
        buttons.set(tab.id, button);
        header.appendChild(button);
    });

    header.setAttribute('role', 'tablist');

    if (activeId) {
        activate(activeId);
    }

    return {
        header,
        body,
        setNote(id, note) {
            notes.set(id, note);
            renderTitles();
        },
        isActive(id) {
            return activeId === id;
        },
    };
}
