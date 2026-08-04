/**
 * Ключ в localStorage, которым сбор диагностики включают руками — в том числе в прод-сборке
 * на стенде. Тот же самый ключ читает панель `@alfalab/scripts-devtools`, решая, показываться
 * ли ей: значение должно совпадать, иначе получится открытая панель без данных.
 *
 * Ключ намеренно продублирован в обоих пакетах, а не вынесен в общий: пакеты не зависят
 * друг от друга, и это часть публичного контракта, а не деталь реализации.
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
        // Проверка `typeof process !== 'undefined'` перед этим всё бы сломала — в браузерном
        // бандле глобального process нет, и до подстановки дело бы не дошло. Если подстановки
        // не случилось, ловим ReferenceError.
        return process.env.NODE_ENV !== 'production';
    } catch {
        return false;
    }
}

function computeCollectingEnabled(): boolean {
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
 * Кешируем решение на всю жизнь страницы: проверка стоит на пути каждого репорта, а их больше
 * трёх десятков на одну загрузку модуля — лезть за флагом в localStorage столько раз незачем.
 * Как следствие, флаг подхватывается только с перезагрузкой; панель читает его ровно так же,
 * так что расхождения между «панель видно» и «данные собираются» не будет.
 */
let cached: boolean | undefined;

/**
 * Собираем ли мы диагностику на этой странице.
 *
 * В dev — да, чтобы панель работала из коробки. В прод-сборке сбор спит: он стоит на горячем
 * пути загрузки каждого модуля и дублирует каждый снимок в sessionStorage, а приложениям,
 * которые панелью не пользуются, платить за это незачем. Разбудить его на стенде можно флагом.
 *
 * Флаг сильнее сборки в обе стороны: им включают сбор на проде и им же выключают его
 * в разработке, если мешает.
 */
export function isCollectingEnabled(): boolean {
    if (cached === undefined) {
        cached = computeCollectingEnabled();
    }

    return cached;
}
