import {
    type DevtoolsSharedRequirement,
    type DevtoolsShareScope,
    type SharedVersion,
    type ShareProblem,
    type ShareScope,
} from '../types';

/**
 * Удовлетворяет ли версия объявленному диапазону.
 *
 * Разбор нарочно грубый: полноценный semver - это зависимость, а пакету её иметь нельзя.
 * Хватает мажора, потому что именно на нём ломается совместимость, а `^18.0.0` против
 * `18.3.1` - самый частый вопрос. Всё, чего не понимаем, считаем удовлетворённым:
 * ложная тревога хуже молчания.
 */
function satisfiesRange(version: string, range: string): boolean {
    const wanted = /^[\^~>=<]*\s*(\d+)\./.exec(range.trim());

    if (!wanted) {
        return true;
    }

    return version.split('.')[0] === wanted[1];
}

function getMajor(version: string): string {
    return version.split('.')[0];
}

/**
 * Что не так со скоупом.
 *
 * Разбор живёт на стороне читателя, а не загрузчика: контракт возит данные, а «проблема» -
 * это уже интерпретация, и она может меняться, не ломая контракт.
 */
function findProblems(
    name: string,
    versions: SharedVersion[],
    requirements: DevtoolsSharedRequirement[],
): ShareProblem[] {
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

    // Каждое требование проверяем отдельно: хост и провайдер могут просить разное,
    // и удовлетворённость одного ничего не говорит про другое. Именно так выглядит
    // самый неприятный случай - в скоупе одна версия, хосту она подходит,
    // а провайдер тихо получает собственную копию.
    requirements.forEach((requirement) => {
        const required = requirement.requiredVersion;

        if (
            required &&
            versions.length > 0 &&
            !versions.some((item) => satisfiesRange(item.version, required))
        ) {
            problems.push({
                type: 'requirement-unsatisfied',
                message: `${requirement.from} просит ${name} ${required}, а в скоупе ${versions
                    .map((item) => item.version)
                    .join(', ')}. Получит не ту версию, на которую рассчитывал.`,
            });
        }
    });

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
export function analyzeShareScopes(
    scopes: DevtoolsShareScope[] | undefined,
    requirements: Record<string, DevtoolsSharedRequirement[]> = {},
): ShareScope[] {
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

            const packageRequirements = requirements?.[item.name] ?? [];

            return {
                name: item.name,
                versions,
                requirements: packageRequirements,
                problems: findProblems(item.name, versions, packageRequirements),
            };
        }),
    }));
}

/** есть ли в снимке хоть одна проблема - по этому вкладка получает маркер внимания */
export function countShareProblems(scopes: ShareScope[]): number {
    return scopes.reduce(
        (total, scope) =>
            total +
            scope.packages.reduce((scopeTotal, item) => scopeTotal + item.problems.length, 0),
        0,
    );
}
