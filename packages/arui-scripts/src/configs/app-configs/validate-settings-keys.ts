import { appConfigsSchema } from './schema';

const settingsSchema = appConfigsSchema.partial().strict();
const validKeys = Object.keys(appConfigsSchema.shape);

function levenshtein(a: string, b: string): number {
    const distances = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1));

    for (let i = 0; i <= a.length; i += 1) distances[i][0] = i;
    for (let j = 0; j <= b.length; j += 1) distances[0][j] = j;

    for (let i = 1; i <= a.length; i += 1) {
        for (let j = 1; j <= b.length; j += 1) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;

            distances[i][j] = Math.min(
                distances[i - 1][j] + 1,
                distances[i][j - 1] + 1,
                distances[i - 1][j - 1] + cost,
            );
        }
    }

    return distances[a.length][b.length];
}

/** Ближайший валидный ключ, если он «достаточно похож» на неизвестный. */
function didYouMean(key: string): string | undefined {
    let best: string | undefined;
    let bestDistance = Infinity;

    validKeys.forEach((valid) => {
        const distance = levenshtein(key.toLowerCase(), valid.toLowerCase());

        if (distance < bestDistance) {
            bestDistance = distance;
            best = valid;
        }
    });

    return bestDistance <= Math.max(2, Math.floor(key.length / 3)) ? best : undefined;
}

/**
 * Проверяет пользовательские настройки по zod-схеме конфигурации: предупреждает о неизвестных
 * ключах (с подсказкой did-you-mean) и о значениях неверного типа. Не бросает — только warn,
 * чтобы не ломать сборку из-за нестрогих настроек.
 */
export function validateSettingsKeys(settingsObject: Record<string, unknown>, source?: string) {
    const result = settingsSchema.safeParse(settingsObject);

    if (result.success) {
        return;
    }

    const location = source || 'конфигурации';

    result.error.issues.forEach((issue) => {
        if (issue.code === 'unrecognized_keys') {
            issue.keys.forEach((key) => {
                const suggestion = didYouMean(key);

                console.warn(
                    `Неизвестная настройка "${key}" в ${location}${
                        suggestion ? ` — возможно, имелось в виду "${suggestion}"?` : ''
                    }`,
                );
            });
        } else {
            console.warn(`Настройка "${issue.path.join('.')}" в ${location}: ${issue.message}`);
        }
    });
}
