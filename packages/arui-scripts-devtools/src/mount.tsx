import { flushSync } from 'react-dom';
import { createRoot, type Root } from 'react-dom/client';

import { PanelApp } from './panel/panel-app';
import { isEscapeFromFilledInput } from './utils/escape-from-input';
import { scopeStyles } from './utils/scope-styles';
import { DEVTOOLS_ROOT_ID } from './constants';
import { pageSource } from './page-source';
import { type MountDevtoolsOptions } from './types';

// css приезжает строкой: правило asset/source в пре-бандле, трансформер в jest
import PANEL_STYLES from './panel/styles.css';

/** функция размонтирования уже смонтированной панели */
let activeUnmount: (() => void) | undefined;

/**
 * Монтирует панель в отдельный хост-элемент с shadow root.
 *
 * Сама панель — React-дерево (приватная копия React из бандла), но вся обвязка снаружи
 * остаётся императивной: хост, shadow root, стили и Esc живут за пределами React,
 * чтобы публичный контракт функции не зависел от рантайма внутри.
 *
 * Панель намеренно ничего не знает об остальной странице: своих стилей наружу не отдаёт,
 * чужих не получает, в фокус не вмешивается. Хост-элементу нельзя проставлять
 * `data-parent-app-id` — по этому атрибуту загрузчик модулей вычищает ресурсы модуля из DOM
 * и заодно снёс бы панель.
 *
 * Повторный вызов, пока панель уже смонтирована, ничего не монтирует и возвращает ту же
 * функцию размонтирования.
 *
 * @returns функция размонтирования; безопасна при повторном вызове
 */
export function mountDevtools(options: MountDevtoolsOptions = {}): () => void {
    if (activeUnmount) {
        return activeUnmount;
    }

    if (typeof document === 'undefined') {
        return () => undefined;
    }

    const container = options.container ?? document.body;

    // энтрипоинт может выполниться до появления body - монтировать пока некуда
    if (!container) {
        return () => undefined;
    }

    const host = document.createElement('div');

    host.id = DEVTOOLS_ROOT_ID;

    // attachShadow есть везде, где нам интересно, но если его вдруг нет - панель без изоляции
    // лучше, чем никакой панели
    const shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : undefined;
    const root: ShadowRoot | HTMLElement = shadow ?? host;

    const style = document.createElement('style');

    // Без shadow root <style> становится документным: `:host` не матчится ни на что, а `.panel`,
    // `.header` и `.button` перекрашивают само приложение. Изоляция в эту сторону не роскошь,
    // а обещание панели, поэтому стили запираем внутри хоста руками. В обратную сторону
    // без shadow root защиты нет: стили приложения панель достанут.
    style.textContent = shadow ? PANEL_STYLES : scopeStyles(PANEL_STYLES, `#${DEVTOOLS_ROOT_ID}`);
    root.appendChild(style);

    // React-корень живёт в своём элементе, а не на shadow root: рядом лежит <style>,
    // и React не должен считать его частью своего дерева
    const reactContainer = document.createElement('div');

    root.appendChild(reactContainer);

    let unmounted = false;
    let reactRoot: Root | undefined;

    function unmount() {
        if (unmounted) {
            return;
        }

        unmounted = true;
        document.removeEventListener('keydown', handleKeydown);
        reactRoot?.unmount();
        host.remove();
        activeUnmount = undefined;
    }

    function close() {
        unmount();
        options.onClose?.();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key !== 'Escape' || event.defaultPrevented) {
            return;
        }

        // Esc в непустом поле ввода - это «очистить поле», а не «закрыть панель»: иначе
        // фильтр во вкладке «События» нельзя было бы сбросить, не потеряв заодно вкладку,
        // раскрытые строки и саму панель
        if (isEscapeFromFilledInput(event)) {
            return;
        }

        close();
    }

    container.appendChild(host);

    document.addEventListener('keydown', handleKeydown);

    // Размонтирование регистрируем до первой отрисовки. Если она упадёт, панель всё равно
    // останется снимаемой: иначе в странице повиснет хост с живым слушателем на document,
    // isDevtoolsMounted() соврёт, а повторный вызов создаст второй такой же хост.
    activeUnmount = unmount;

    try {
        reactRoot = createRoot(reactContainer);
        // синхронный первый кадр: после возврата из mountDevtools панель уже в DOM -
        // ровно это обещала vanilla-версия, и на это полагаются вызывающие
        flushSync(() => {
            // mountDevtools - не render-функция, ссылка на close создаётся один раз за монтирование
            // eslint-disable-next-line react/jsx-no-bind
            reactRoot?.render(<PanelApp source={pageSource} onClose={close} />);
        });
    } catch (error) {
        // внутри дерева ошибки ловит PanelErrorBoundary; сюда долетает только поломка самого
        // React-корня - панель в этом случае остаётся пустой, но снимаемой, а страница живой
        // eslint-disable-next-line no-console
        console.error('[arui devtools] не удалось отрисовать панель', error);
    }

    return unmount;
}

/** смонтирована ли панель прямо сейчас */
export function isDevtoolsMounted(): boolean {
    return Boolean(activeUnmount);
}

/** размонтирует панель, если она смонтирована */
export function unmountDevtools(): void {
    activeUnmount?.();
}
