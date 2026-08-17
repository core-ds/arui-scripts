import { type ChromeApi, type DeclarativeNetRequestRule, getChromeApi } from './chrome-api';

/**
 * Подмена адреса модуля на локальный дев-сервер.
 *
 * Ради этого расширение и стоило делать: чтобы проверить правку в провайдере на реальном стенде,
 * иначе пришлось бы собрать его и выложить. Правила живут в сессии браузера
 * (`updateSessionRules`) - перезапуск Chrome их снимает, и забытая подмена не переживёт день.
 *
 * Доступ к origin просим только в момент включения: пока подменой не пользуются, расширение
 * не имеет прав ни на одну страницу.
 */

/** правила складываем в свой диапазон id, чтобы не спорить с чужими */
const RULE_ID_BASE = 4200;

export type Override = {
    /** origin, как он записан в диагностике, например `http://cdn.example.com` */
    from: string;
    /** куда перенаправлять, например `http://localhost:8082` */
    to: string;
};

function parseOrigin(value: string): URL | undefined {
    try {
        const url = new URL(value);

        return url.protocol === 'http:' || url.protocol === 'https:' ? url : undefined;
    } catch {
        return undefined;
    }
}

/** правило пригодно к применению: оба адреса - настоящие origin и они разные */
export function isValidOverride(override: Override): boolean {
    const from = parseOrigin(override.from);
    const to = parseOrigin(override.to);

    return Boolean(from && to && from.origin !== to.origin);
}

/**
 * Переводит подмену в правило declarativeNetRequest.
 *
 * Подменяем только схему, хост и порт: путь модуля остаётся тем же, иначе локальный сервер
 * не найдёт ни манифест, ни бандлы.
 */
export function toRule(override: Override, index: number): DeclarativeNetRequestRule | undefined {
    const from = parseOrigin(override.from);
    const to = parseOrigin(override.to);

    if (!from || !to) {
        return undefined;
    }

    return {
        id: RULE_ID_BASE + index,
        priority: 1,
        action: {
            type: 'redirect',
            redirect: {
                transform: {
                    scheme: to.protocol.replace(':', ''),
                    host: to.hostname,
                    // порт по умолчанию приходит пустой строкой - так его и передаём
                    port: to.port,
                },
            },
        },
        condition: {
            // `||` в urlFilter - это «начало домена»; путь не трогаем вовсе
            urlFilter: `|${from.origin}/`,
            resourceTypes: ['script', 'stylesheet', 'xmlhttprequest', 'main_frame', 'sub_frame'],
        },
    };
}

function callbackToPromise<T>(run: (resolve: (value: T) => void) => void): Promise<T> {
    return new Promise((resolve) => {
        try {
            run(resolve);
        } catch {
            resolve(undefined as T);
        }
    });
}

/** выданы ли уже права на origin, который собираемся подменять */
export function hasOriginPermission(
    origin: string,
    api: ChromeApi | undefined = getChromeApi(),
): Promise<boolean> {
    const permissions = api?.permissions;

    if (!permissions?.contains) {
        return Promise.resolve(false);
    }

    return callbackToPromise<boolean>((resolve) =>
        permissions.contains({ origins: [`${origin}/*`] }, (granted) => resolve(Boolean(granted))),
    );
}

/**
 * Просит доступ к origin. Вызывать только из обработчика клика: Chrome показывает диалог
 * лишь в ответ на действие пользователя.
 */
export function requestOriginPermission(
    origin: string,
    api: ChromeApi | undefined = getChromeApi(),
): Promise<boolean> {
    const permissions = api?.permissions;

    if (!permissions?.request) {
        return Promise.resolve(false);
    }

    return callbackToPromise<boolean>((resolve) =>
        permissions.request({ origins: [`${origin}/*`] }, (granted) => resolve(Boolean(granted))),
    );
}

/**
 * Ставит ровно тот набор правил, который передали: старые снимаются, новые применяются.
 *
 * Полная замена, а не добавление: набор подмен - это состояние, и держать его в одном месте
 * проще, чем сводить дельты.
 */
export function applyOverrides(
    overrides: Override[],
    api: ChromeApi | undefined = getChromeApi(),
): Promise<void> {
    const dnr = api?.declarativeNetRequest;

    if (!dnr?.updateSessionRules) {
        return Promise.resolve();
    }

    const addRules = overrides
        .filter(isValidOverride)
        .map((override, index) => toRule(override, index))
        .filter((rule): rule is DeclarativeNetRequestRule => rule !== undefined);

    return callbackToPromise<void>((resolve) => {
        dnr.getSessionRules((existing) => {
            const removeRuleIds = (existing ?? [])
                .map((rule) => rule.id)
                // чужие правила не наши - трогаем только свой диапазон
                .filter((id) => id >= RULE_ID_BASE && id < RULE_ID_BASE + 1000);

            dnr.updateSessionRules({ removeRuleIds, addRules }, () => resolve());
        });
    });
}
