import { type DevtoolsShareScope, type DevtoolsSharedVersion } from './types';

type RawShareConfig = {
    singleton?: boolean;
    requiredVersion?: string | false;
    strictVersion?: boolean;
    eager?: boolean;
};

type RawSharedItem = {
    loaded?: unknown;
    eager?: unknown;
    from?: unknown;
    shareConfig?: RawShareConfig;
};

/**
 * Содержимое share scope на текущий момент.
 *
 * `__webpack_share_scopes__` - свободная переменная бандлера, а не свойство `window`: её
 * подставляет rspack того бандла, в который попал загрузчик. Достать её снаружи - из расширения
 * браузера или из консоли - нельзя в принципе, поэтому снимок кладёт в контракт сам загрузчик:
 * он единственный, кто находится внутри бандла и при этом обязан рассказывать о происходящем.
 *
 * Читаем только данные: `get()` у записи вызывать нельзя - это исполнит шаренный модуль,
 * то есть диагностика своим существованием изменит поведение приложения.
 *
 * @returns список скоупов; пустой, если module federation в приложении не используется
 */
export function readShareScopes(): DevtoolsShareScope[] {
    try {
        // typeof на необъявленном идентификаторе не бросает - единственный безопасный способ
        // спросить про свободную переменную, которой может не быть. Второй guard обязателен:
        // бандлер заменяет typeof литералом "object", а значение остаётся undefined,
        // пока share-рантайм не подключён
        if (typeof __webpack_share_scopes__ === 'undefined' || !__webpack_share_scopes__) {
            return [];
        }

        const raw = __webpack_share_scopes__ as unknown as Record<
            string,
            Record<string, Record<string, RawSharedItem>>
        >;

        return Object.keys(raw).map((scopeName) => {
            const scope = raw[scopeName] ?? {};

            return {
                name: scopeName,
                packages: Object.keys(scope).map((packageName) => ({
                    name: packageName,
                    versions: Object.keys(scope[packageName] ?? {}).map((version) =>
                        toSharedVersion(version, scope[packageName][version]),
                    ),
                })),
            };
        });
    } catch {
        // диагностика не имеет права уронить загрузку модуля ни при каких обстоятельствах
        return [];
    }
}

/**
 * Приводит запись скоупа к сериализуемому виду.
 *
 * В самой записи лежат ещё и функции (`get`, `factory`), а контракт обещает читателям
 * только данные: снимок уезжает в sessionStorage и в расширение браузера через JSON.
 */
function toSharedVersion(version: string, raw: RawSharedItem): DevtoolsSharedVersion {
    const shareConfig = raw?.shareConfig ?? {};

    return {
        version,
        from: typeof raw?.from === 'string' ? raw.from : undefined,
        // в разных версиях рантайма это то флаг, то счётчик, то функция-геттер
        loaded: Boolean(raw?.loaded),
        eager: shareConfig.eager ?? (typeof raw?.eager === 'boolean' ? raw.eager : undefined),
        singleton: shareConfig.singleton,
        requiredVersion:
            typeof shareConfig.requiredVersion === 'string'
                ? shareConfig.requiredVersion
                : undefined,
        strictVersion: shareConfig.strictVersion,
    };
}
