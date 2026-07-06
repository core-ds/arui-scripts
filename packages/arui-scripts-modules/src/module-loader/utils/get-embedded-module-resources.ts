import { type BaseModuleState, type ModuleResources } from '../types';

/**
 * Атрибут `<script>`-тега со встроенным payload-ом ресурсов модуля.
 * Значение атрибута — `moduleId`.
 */
export const MODULE_SSR_PAYLOAD_ATTRIBUTE = 'data-module-ssr-payload';
/**
 * Атрибут `<script>`-тега со встроенным payload-ом, различающий несколько
 * инстансов одного модуля на странице. Значение атрибута — `instanceId`.
 */
export const MODULE_SSR_INSTANCE_ATTRIBUTE = 'data-module-instance';

/**
 * Читает встроенный (embedded) payload с ресурсами модуля, который хост-сервер
 * сериализовал в `<script type="application/json">`.
 *
 * Позволяет клиенту получить результат `getModuleResources` без повторного сетевого
 * запроса. Поле `html` в payload не входит (оно уже присутствует в DOM).
 *
 * @param moduleId id модуля
 * @param instanceId опциональный id инстанса — нужен, если на странице несколько
 *   инстансов одного модуля. Если не передан, берётся первый найденный payload модуля.
 * @returns ресурсы модуля или `undefined`, если payload не найден / не распарсился.
 */
export function getEmbeddedModuleResources<ModuleState extends BaseModuleState = BaseModuleState>(
    moduleId: string,
    instanceId?: string,
): ModuleResources<ModuleState> | undefined {
    if (typeof document === 'undefined') {
        return undefined;
    }

    const scripts = document.querySelectorAll<HTMLScriptElement>(
        `script[${MODULE_SSR_PAYLOAD_ATTRIBUTE}]`,
    );

    const script = Array.from(scripts).find((node) => {
        if (node.getAttribute(MODULE_SSR_PAYLOAD_ATTRIBUTE) !== moduleId) {
            return false;
        }

        if (instanceId === undefined) {
            return true;
        }

        return node.getAttribute(MODULE_SSR_INSTANCE_ATTRIBUTE) === instanceId;
    });

    if (!script?.textContent) {
        return undefined;
    }

    try {
        return JSON.parse(script.textContent) as ModuleResources<ModuleState>;
    } catch {
        return undefined;
    }
}
