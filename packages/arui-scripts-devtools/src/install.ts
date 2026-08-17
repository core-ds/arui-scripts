import { mountBadge } from './ui/badge';
import { readPanelState, writePanelState } from './utils/panel-state';
import {
    DEVTOOLS_ENABLED_KEY,
    DEVTOOLS_GLOBAL_KEY,
    DEVTOOLS_MODULES_NAMESPACE,
    DEVTOOLS_READY_EVENT,
    DISABLED_VALUES,
    ENABLED_VALUES,
} from './constants';
import { type GlobalWithDevtools } from './types';

function readFlag(): string | undefined {
    try {
        // в приватных режимах некоторых браузеров обращение к localStorage кидает
        return typeof localStorage === 'undefined'
            ? undefined
            : localStorage.getItem(DEVTOOLS_ENABLED_KEY)?.trim().toLowerCase() || undefined;
    } catch {
        return undefined;
    }
}

function isDevBuild(): boolean {
    try {
        // Обращение к process.env.NODE_ENV должно быть буквальным: бандлер подставляет сюда
        // строку на этапе сборки. Проверка `typeof process !== 'undefined'` перед этим всё бы
        // сломала - в браузерном бандле глобального process нет, и до подстановки дело бы
        // не дошло. Если подстановки не случилось, ловим ReferenceError.
        return process.env.NODE_ENV !== 'production';
    } catch {
        return false;
    }
}

/**
 * Включена ли панель на этой странице.
 *
 * Флаг в localStorage сильнее сборки в обе стороны: им включают панель на проде
 * и им же выключают её в разработке, если мешает.
 */
export function isDevtoolsEnabled(): boolean {
    const flag = readFlag();

    if (flag && ENABLED_VALUES.indexOf(flag) !== -1) {
        return true;
    }

    if (flag && DISABLED_VALUES.indexOf(flag) !== -1) {
        return false;
    }

    return isDevBuild();
}

/**
 * Есть ли на странице стор загрузчика модулей.
 *
 * Нарочно не через `store-client`: там разбор снимка и работа с версиями, а этот файл целиком
 * лежит в основном бандле — сюда стоит тащить только то, без чего не обойтись. Версию тут тоже
 * не проверяем: несовместимый стор всё равно означает, что модули на странице есть, и панель
 * должна открыться хотя бы для того, чтобы сказать об этом.
 */
function hasModulesStore(): boolean {
    try {
        const root = (globalThis as GlobalWithDevtools)[DEVTOOLS_GLOBAL_KEY];

        return Boolean(root?.[DEVTOOLS_MODULES_NAMESPACE]);
    } catch {
        return false;
    }
}

/** Ctrl+Shift+M, на маке ещё и Cmd+Shift+M */
export function isToggleHotkey(event: KeyboardEvent): boolean {
    if (!event.shiftKey || !(event.ctrlKey || event.metaKey) || event.altKey) {
        return false;
    }

    // code не зависит от раскладки, но его нет в старых браузерах и в части синтетических событий
    return event.code === 'KeyM' || (!event.code && event.key.toLowerCase() === 'm');
}

/**
 * Вешает хоткей и бейдж. Саму панель не грузит: её код лежит в отдельном чанке
 * и приезжает только когда панель открывают.
 *
 * @returns функция, снимающая всё установленное, включая открытую панель
 */
export function installDevtools(): () => void {
    if (typeof document === 'undefined' || !isDevtoolsEnabled()) {
        return () => undefined;
    }

    let unmountPanel: (() => void) | undefined;
    let opening = false;

    function open() {
        if (unmountPanel || opening) {
            return;
        }

        opening = true;

        // именно динамический импорт: код панели должен уехать в отдельный чанк,
        // в основном бандле остаётся только этот файл с хоткеем и бейджем.
        // Имя чанка фиксируем: иначе в prod оно превращается в числовой id,
        // а дефолтные cacheGroups splitChunks охотнее дробят безымянное
        import(/* webpackChunkName: "arui-devtools-panel" */ './mount').then(
            ({ mountDevtools }) => {
                opening = false;
                unmountPanel = mountDevtools({
                    onClose: () => {
                        unmountPanel = undefined;
                        writePanelState({ open: false });
                    },
                });
                writePanelState({ open: true });
            },
            (error) => {
                opening = false;
                // панель не должна ронять приложение, в которое её инжектнули
                // eslint-disable-next-line no-console
                console.error('[arui devtools] не удалось загрузить панель', error);
            },
        );
    }

    function toggle() {
        if (unmountPanel) {
            unmountPanel();
            unmountPanel = undefined;
            writePanelState({ open: false });

            return;
        }

        open();
    }

    function handleKeydown(event: KeyboardEvent) {
        if (isToggleHotkey(event)) {
            event.preventDefault();
            toggle();
        }
    }

    let unmountBadge: (() => void) | undefined;
    let domReady = false;

    function showBadge() {
        if (!unmountBadge) {
            unmountBadge = mountBadge(toggle);
        }
    }

    /**
     * Показывать ли бейдж прямо сейчас.
     *
     * Бейдж появляется только когда на странице действительно есть загрузчик модулей: понять
     * это на этапе сборки нельзя — хост-потребитель модули не конфигурирует, он подключает их
     * в рантайме, — поэтому ждём появления стора. Приложению без микрофронтов бейдж в углу
     * не нужен, а хоткей работает всегда: открыть панель и убедиться, что модулей нет, можно
     * и без него.
     */
    function syncBadge() {
        if (!domReady || unmountBadge) {
            return;
        }

        // панель была открыта до перезагрузки - возвращаем её сразу, не дожидаясь модулей:
        // пользователь уже сказал, что она ему нужна, иначе отладка сводится к тому,
        // чтобы открывать её заново после каждого обновления страницы
        if (readPanelState().open) {
            showBadge();
            open();

            return;
        }

        if (hasModulesStore()) {
            showBadge();
        }
    }

    function handleDomReady() {
        domReady = true;
        syncBadge();
    }

    document.addEventListener('keydown', handleKeydown);
    // стор мог появиться и до нас, и сильно позже - поэтому и проверка, и подписка
    window.addEventListener(DEVTOOLS_READY_EVENT, syncBadge);

    // энтрипоинт может выполниться до появления body - тогда ждём разбора документа
    if (document.body) {
        handleDomReady();
    } else {
        document.addEventListener('DOMContentLoaded', handleDomReady);
    }

    return () => {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('DOMContentLoaded', handleDomReady);
        window.removeEventListener(DEVTOOLS_READY_EVENT, syncBadge);
        unmountBadge?.();
        unmountBadge = undefined;
        unmountPanel?.();
        unmountPanel = undefined;
    };
}
