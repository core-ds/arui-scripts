import {
    type RawSharedItem,
    type SharedPackage,
    type SharedVersion,
    type ShareProblem,
    type ShareScope,
} from './types';

/**
 * `__webpack_share_scopes__` - свободная переменная webpack/rspack, а не свойство `window`:
 * бандлер подставляет её при сборке того бандла, в который попала панель.
 * Если module federation в приложении не включён, значением будет `undefined`.
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __webpack_share_scopes__: unknown;

function readRawShareScopes(): Record<string, unknown> | undefined {
    try {
        // typeof на необъявленном идентификаторе не бросает - это единственный безопасный способ
        // спросить про свободную переменную, которой может не быть. Второй guard обязателен:
        // бандлер заменяет typeof литералом "object", а значение остаётся undefined,
        // пока share-рантайм не подключён
        if (typeof __webpack_share_scopes__ === 'undefined' || !__webpack_share_scopes__) {
            return undefined;
        }

        return __webpack_share_scopes__ as Record<string, unknown>;
    } catch {
        return undefined;
    }
}

function getMajor(version: string): string {
    return version.split('.')[0];
}

function toSharedVersion(version: string, raw: RawSharedItem): SharedVersion {
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

function findProblems(name: string, versions: SharedVersion[]): ShareProblem[] {
    const problems: ShareProblem[] = [];

    if (versions.length > 1) {
        problems.push({
            type: 'multiple-versions',
            message: `В скоупе несколько версий ${name}: ${versions
                .map((item) => item.version)
                .join(', ')}. Потребители могут получить разные копии.`,
        });
    }

    const singletonMajors = versions
        .filter((item) => item.singleton)
        .map((item) => getMajor(item.version));

    if (new Set(singletonMajors).size > 1) {
        problems.push({
            type: 'singleton-major-mismatch',
            message: `${name} объявлен singleton, но мажоры разъезжаются: ${Array.from(
                new Set(singletonMajors),
            ).join(', ')}. Кто-то получит несовместимую версию.`,
        });
    }

    return problems;
}

/**
 * Снимок share scope на текущий момент.
 *
 * Читаем только данные: `get()` у записи вызывать нельзя - это исполнит шаренный модуль,
 * то есть панель своим существованием изменит поведение приложения.
 *
 * @returns список скоупов; пустой, если module federation в приложении не используется
 */
export function readShareScopes(): ShareScope[] {
    const raw = readRawShareScopes();

    if (!raw) {
        return [];
    }

    try {
        return Object.keys(raw).map((scopeName) => {
            const scope = (raw[scopeName] ?? {}) as Record<string, Record<string, RawSharedItem>>;

            const packages: SharedPackage[] = Object.keys(scope).map((name) => {
                const versions = Object.keys(scope[name] ?? {})
                    .map((version) => toSharedVersion(version, scope[name][version]))
                    // numeric: иначе сравниваются строки, и 10.0.0 встаёт перед 9.0.0 -
                    // список версий выглядит откатившимся на мажор назад
                    .sort((left, right) =>
                        left.version.localeCompare(right.version, undefined, { numeric: true }),
                    );

                return { name, versions, problems: findProblems(name, versions) };
            });

            return { name: scopeName, packages };
        });
    } catch {
        return [];
    }
}

/** есть ли в снимке хоть одна проблема - нужно, чтобы подсветить вкладку */
export function countShareProblems(scopes: ShareScope[]): number {
    return scopes.reduce(
        (total, scope) =>
            total +
            scope.packages.reduce((scopeTotal, item) => scopeTotal + item.problems.length, 0),
        0,
    );
}
