import { getChromeApi } from '../extension/chrome-api';

/**
 * Умеет ли текущее окружение открывать файлы во вкладке Sources.
 *
 * В тестах и в любом окружении без DevTools API - нет, и тогда кадры стека остаются
 * обычным текстом.
 */
export function canOpenResource(): boolean {
    return typeof getChromeApi()?.devtools?.panels?.openResource === 'function';
}

/**
 * Открывает файл во вкладке Sources на нужной строке.
 *
 * Ради этого перехода стек и показывается: искать файл руками, переписывая url из текста,
 * - самая бессмысленная часть разбора упавшего модуля.
 */
export function openResource(url: string, line: number): void {
    try {
        getChromeApi()?.devtools?.panels?.openResource?.(url, line);
    } catch {
        // ресурса может не оказаться в списке загруженных - это не повод ломать панель
    }
}
