import { STORE_POLL_INTERVAL } from '../constants';
import {
    type DevtoolsState,
    type PageClock,
    type PanelSource,
    type PanelVisibility,
} from '../types';

import { type ChromeApi, getChromeApi } from './chrome-api';
import { SNAPSHOT_EXPRESSION } from './snapshot-expression';
import { panelVisibility } from './visibility';

const WAITING: DevtoolsState = { modules: { status: 'waiting' }, eventBus: { status: 'waiting' } };

/** похоже ли то, что вернул неймспейс, на состояние стора */
function isNamespaceState(value: unknown): boolean {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const { status } = value as { status?: unknown };

    return status === 'ready' || status === 'waiting' || status === 'unsupported';
}

/** часы страницы: без конечного числа они бесполезны, а врать про время хуже, чем молчать */
function toPageClock(value: unknown): PageClock | undefined {
    if (typeof value !== 'object' || value === null) {
        return undefined;
    }

    const { timeOrigin } = value as { timeOrigin?: unknown };

    return typeof timeOrigin === 'number' && Number.isFinite(timeOrigin)
        ? { timeOrigin }
        : undefined;
}

/** ответ страницы: оба неймспейса разом. Незнакомое приводим к «ждём» */
function toDevtoolsState(value: unknown): DevtoolsState {
    if (typeof value !== 'object' || value === null) {
        return WAITING;
    }

    const { modules, eventBus, page } = value as {
        modules?: unknown;
        eventBus?: unknown;
        page?: unknown;
    };

    return {
        modules: isNamespaceState(modules)
            ? (modules as DevtoolsState['modules'])
            : { status: 'waiting' },
        eventBus: isNamespaceState(eventBus)
            ? (eventBus as DevtoolsState['eventBus'])
            : { status: 'waiting' },
        page: toPageClock(page),
    };
}

/**
 * Источник данных для расширения браузера.
 *
 * Подписаться на стор отсюда нельзя: он живёт в другом мире, а `inspectedWindow.eval` умеет
 * только «спросить и получить ответ». Поэтому спрашиваем по таймеру и молчим, пока ответ
 * не изменился, - иначе панель перерисовывалась бы дважды в секунду на ровном месте.
 *
 * Ответ приезжает структурным клоном: функций и ссылок в нём нет и быть не может, только данные.
 *
 * Из часов страницы забираем одно начало отсчёта, а не текущее время: `timeOrigin` не меняется,
 * пока страница та же, поэтому отпечаток ответа остаётся стабильным. Живое «сейчас» панель
 * считает сама - `Date.now()` у неё и у страницы общий.
 *
 * Пока вкладку панели не видно, опрос молчит: `eval` в чужой документ дважды в секунду ради
 * данных, на которые никто не смотрит, - чистая работа вхолостую. На возвращении спрашиваем
 * сразу, не дожидаясь тика.
 */
export function createExtensionSource(
    api: ChromeApi | undefined = getChromeApi(),
    visibility: PanelVisibility = panelVisibility,
): PanelSource {
    return {
        getInitialState: () => WAITING,

        subscribe(listener) {
            const inspectedWindow = api?.devtools?.inspectedWindow;

            if (!inspectedWindow?.eval) {
                // вне расширения показывать нечего, но и падать не надо
                listener(WAITING);

                return () => undefined;
            }

            let stopped = false;
            let lastSignature: string | undefined;

            function emit(state: DevtoolsState) {
                if (stopped) {
                    return;
                }

                let signature: string | undefined;

                try {
                    signature = JSON.stringify(state);
                } catch {
                    // несериализуемого тут быть не может, но сравнение - не повод падать
                    signature = undefined;
                }

                if (signature !== undefined && signature === lastSignature) {
                    return;
                }

                lastSignature = signature;
                listener(state);
            }

            function poll() {
                inspectedWindow!.eval(SNAPSHOT_EXPRESSION, (result, exceptionInfo) => {
                    if (exceptionInfo?.isError || exceptionInfo?.isException) {
                        // страница ещё не загрузилась или это вообще не наша страница
                        emit(WAITING);

                        return;
                    }

                    emit(toDevtoolsState(result));
                });
            }

            let timer: ReturnType<typeof setInterval> | undefined;

            function startPolling() {
                if (timer === undefined) {
                    timer = setInterval(poll, STORE_POLL_INTERVAL);
                }
            }

            function stopPolling() {
                if (timer !== undefined) {
                    clearInterval(timer);
                    timer = undefined;
                }
            }

            /**
             * После перехода на другую страницу стор в ней новый - и, скорее всего, пустой.
             * Сбрасываем отпечаток, чтобы следующий ответ доехал до панели, даже если
             * по содержимому совпал с предыдущим.
             */
            function handleNavigated() {
                lastSignature = undefined;

                if (visibility.isVisible()) {
                    poll();
                }
            }

            const onNavigated = api?.devtools?.network?.onNavigated;

            onNavigated?.addListener(handleNavigated);

            const unsubscribeVisibility = visibility.subscribe((visible) => {
                if (!visible) {
                    stopPolling();

                    return;
                }

                // пока вкладку не смотрели, страница успела прожить свою жизнь:
                // спрашиваем сразу, а не через полсекунды
                poll();
                startPolling();
            });

            if (visibility.isVisible()) {
                poll();
                startPolling();
            }

            return () => {
                stopped = true;
                stopPolling();
                unsubscribeVisibility();
                onNavigated?.removeListener(handleNavigated);
            };
        },
    };
}
