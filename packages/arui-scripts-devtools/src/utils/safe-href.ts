/**
 * Ссылку делаем только на то, что браузер откроет как страницу.
 *
 * `href` исполняет и `javascript:`, а url приезжает из манифеста, то есть снаружи. Правами это
 * никого не наделяет - кто пишет манифест, тот и так получает произвольный `<script src>`
 * в origin приложения, - но панель не обязана добавлять к этому ещё один способ.
 *
 * @returns абсолютный url или undefined, если открывать его не стоит
 */
export function toSafeHref(url: string): string | undefined {
    try {
        // относительный путь - обычное дело для модуля с того же origin, поэтому с базой
        const { protocol, href } = new URL(url, document.baseURI);

        return protocol === 'http:' || protocol === 'https:' ? href : undefined;
    } catch {
        return undefined;
    }
}
