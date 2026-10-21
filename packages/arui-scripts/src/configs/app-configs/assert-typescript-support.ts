import { type AppContextWithConfigs } from './types';

type TypescriptDependentConfig = Pick<
    AppContextWithConfigs,
    'codeLoader' | 'jestCodeTransformer' | 'tsconfig'
>;

/** Версия установленного TypeScript или `null`, если он не установлен. */
export function getInstalledTypescriptVersion(): string | null {
    try {
        // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
        return require('typescript/package.json').version;
    } catch {
        return null;
    }
}

export function assertTypescriptSupport(
    config: TypescriptDependentConfig,
    typescriptVersion = getInstalledTypescriptVersion(),
) {
    if (!typescriptVersion || Number.parseInt(typescriptVersion, 10) !== 7) {
        throw new Error(
            'arui-scripts поддерживает только TypeScript 7. Установите typescript@^7.0.0. ' +
                `Текущая версия: ${typescriptVersion ?? 'не установлен'}.`,
        );
    }

    for (const setting of ['codeLoader', 'jestCodeTransformer'] as const) {
        if (!['swc', 'babel'].includes(config[setting])) {
            throw new Error(
                `Настройка \`${setting}: "${config[setting]}"\` удалена. ` +
                    `Используйте \`${setting}: "swc" или "babel"\`.`,
            );
        }
    }
}
