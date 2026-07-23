import { z } from 'zod';

import { type AppContextWithConfigs } from './types';

/**
 * Кросс-полевые правила конфигурации через zod-refinement. Работает на финальном (уже слитом
 * с дефолтами) конфиге, поэтому z.custom не перевалидирует типы полей — только сами правила.
 */
const crossFieldRules = z.custom<AppContextWithConfigs>().superRefine((config, ctx) => {
    if (config.experimentalReactCompiler !== 'disabled' && config.codeLoader !== 'swc') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
                'Использование `experimentalReactCompiler` на данный момент поддерживается только с `codeLoader: "swc"`. \nЛибо выключите `experimentalReactCompiler`, либо измените настройку для `codeLoader`.',
        });
    }
});

export function validateConfig(config: AppContextWithConfigs) {
    const result = crossFieldRules.safeParse(config);

    if (!result.success) {
        throw new Error(result.error.issues.map((issue) => issue.message).join('\n'));
    }
}
