/**
 * Тот же ключ, которым включается диагностика загрузчика модулей: пользователь выставляет его
 * один раз, а собирают данные разные пакеты. Ключ намеренно продублирован, а не вынесен
 * в общий пакет - зависимости между ними нет, и это часть публичного контракта.
 */
export const DEVTOOLS_ENABLED_KEY = 'arui:devtools';

const ENABLED_VALUES = ['1', 'true', 'on'];
const DISABLED_VALUES = ['0', 'false', 'off'];

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
        // строку на этапе сборки, и в прод-бандле всё это условие сворачивается в константу.
        return process.env.NODE_ENV !== 'production';
    } catch {
        return false;
    }
}

let cached: boolean | undefined;

/**
 * Собираем ли диагностику шины.
 *
 * В dev - да. В прод-сборке сбор спит: он стоит на пути каждого события, а приложениям,
 * которые расширением отладки не пользуются, платить за это незачем. Разбудить можно флагом.
 */
export function isCollectingEnabled(): boolean {
    if (cached === undefined) {
        cached = computeEnabled();
    }

    return cached;
}

function computeEnabled(): boolean {
    const flag = readFlag();

    if (flag && ENABLED_VALUES.indexOf(flag) !== -1) {
        return true;
    }

    if (flag && DISABLED_VALUES.indexOf(flag) !== -1) {
        return false;
    }

    return isDevBuild();
}
