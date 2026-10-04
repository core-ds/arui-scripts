import { type AppContextWithConfigs } from './types';

const TYPESCRIPT_WITHOUT_JS_API = 7;

type TypescriptDependentConfig = Pick<
    AppContextWithConfigs,
    'codeLoader' | 'jestCodeTransformer' | 'tsconfig'
>;

/**
 * Версия установленного typescript или `null`, если он не установлен.
 */
export function getInstalledTypescriptVersion(): string | null {
    try {
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        return require('typescript/package.json').version;
    } catch {
        return null;
    }
}

function describeProblem(setting: string, tool: string, typescriptVersion: string) {
    return [
        `Настройка \`${setting}: "tsc"\` не работает с TypeScript ${typescriptVersion}:`,
        `${tool} использует JavaScript API, которого в TypeScript ${TYPESCRIPT_WITHOUT_JS_API} нет.`,
        `Используйте \`${setting}: "swc"\` или \`"babel"\`, либо оставайтесь на TypeScript ${
            TYPESCRIPT_WITHOUT_JS_API - 1
        }.`,
    ].join(' ');
}

/**
 * Загрузчики `tsc` (ts-loader и ts-jest) работают через JavaScript API TypeScript, которого нет в TypeScript 7.
 * Без этой проверки они падают с непонятной ошибкой вроде `Cannot read properties of undefined (reading 'fileExists')`.
 */
export function assertTypescriptSupport(
    config: TypescriptDependentConfig,
    typescriptVersion = getInstalledTypescriptVersion(),
) {
    if (!typescriptVersion || Number.parseInt(typescriptVersion, 10) < TYPESCRIPT_WITHOUT_JS_API) {
        return;
    }

    const problems: string[] = [];

    // ts-loader подключается только при наличии tsconfig, без него настройка ничего не ломает
    if (config.codeLoader === 'tsc' && config.tsconfig) {
        problems.push(describeProblem('codeLoader', 'ts-loader', typescriptVersion));
    }

    if (config.jestCodeTransformer === 'tsc') {
        problems.push(describeProblem('jestCodeTransformer', 'ts-jest', typescriptVersion));
    }

    if (problems.length > 0) {
        throw new Error(problems.join('\n'));
    }
}
