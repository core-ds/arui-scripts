import {
    type DevtoolsShareScope,
    type SharedVersion,
    type ShareProblem,
    type ShareScope,
} from '../types';

function getMajor(version: string): string {
    return version.split('.')[0];
}

/**
 * Что не так со скоупом.
 *
 * Разбор живёт на стороне читателя, а не загрузчика: контракт возит данные, а «проблема» -
 * это уже интерпретация, и она может меняться, не ломая контракт.
 */
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
 * Приводит снимок скоупа из контракта к тому, что показывает панель: версии по порядку
 * и найденные проблемы.
 *
 * Сам скоуп панель не читает и прочитать не может: `__webpack_share_scopes__` - свободная
 * переменная бандлера, её видно только изнутри бандла приложения. Снимок кладёт в контракт
 * загрузчик, а панель - хоть инжектнутая в страницу, хоть расширение браузера - разбирает
 * одни и те же данные.
 */
export function analyzeShareScopes(scopes: DevtoolsShareScope[] | undefined): ShareScope[] {
    if (!Array.isArray(scopes)) {
        return [];
    }

    return scopes.map((scope) => ({
        name: scope.name,
        packages: (scope.packages ?? []).map((item) => {
            const versions = (item.versions ?? [])
                .slice()
                // numeric: иначе сравниваются строки, и 10.0.0 встаёт перед 9.0.0 -
                // список версий выглядит откатившимся на мажор назад
                .sort((left, right) =>
                    left.version.localeCompare(right.version, undefined, { numeric: true }),
                );

            return { name: item.name, versions, problems: findProblems(item.name, versions) };
        }),
    }));
}

/** сколько всего проблем в снимке - нужно, чтобы подсветить вкладку */
export function countShareProblems(scopes: ShareScope[]): number {
    return scopes.reduce(
        (total, scope) =>
            total +
            scope.packages.reduce((scopeTotal, item) => scopeTotal + item.problems.length, 0),
        0,
    );
}
