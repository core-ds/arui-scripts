import { STORE_POLL_INTERVAL } from '../constants';
import { type ModulesStoreState, type PanelSource } from '../types';

import { type ChromeApi, getChromeApi } from './chrome-api';
import { SNAPSHOT_EXPRESSION } from './snapshot-expression';

const WAITING: ModulesStoreState = { status: 'waiting' };

/** похоже ли то, что вернула страница, на состояние стора */
function isStoreState(value: unknown): value is ModulesStoreState {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const { status } = value as { status?: unknown };

    return status === 'ready' || status === 'waiting' || status === 'unsupported';
}

/**
 * Источник данных для расширения браузера.
 *
 * Подписаться на стор отсюда нельзя: он живёт в другом мире, а `inspectedWindow.eval` умеет
 * только «спросить и получить ответ». Поэтому спрашиваем по таймеру и молчим, пока ответ
 * не изменился, - иначе панель перерисовывалась бы дважды в секунду на ровном месте.
 *
 * Ответ приезжает структурным клоном: функций и ссылок в нём нет и быть не может, только данные.
 */
export function createExtensionSource(api: ChromeApi | undefined = getChromeApi()): PanelSource {
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

            function emit(state: ModulesStoreState) {
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

                    emit(isStoreState(result) ? result : WAITING);
                });
            }

            const timer = setInterval(poll, STORE_POLL_INTERVAL);

            /**
             * После перехода на другую страницу стор в ней новый - и, скорее всего, пустой.
             * Сбрасываем отпечаток, чтобы следующий ответ доехал до панели, даже если
             * по содержимому совпал с предыдущим.
             */
            function handleNavigated() {
                lastSignature = undefined;
                poll();
            }

            const onNavigated = api?.devtools?.network?.onNavigated;

            onNavigated?.addListener(handleNavigated);
            poll();

            return () => {
                stopped = true;
                clearInterval(timer);
                onNavigated?.removeListener(handleNavigated);
            };
        },
    };
}
