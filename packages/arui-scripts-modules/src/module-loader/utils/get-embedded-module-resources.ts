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
 * Атрибут `<style>`/`<link>`-тега со стилями модуля, отрендеренными на сервере.
 * Значение — исходный (resolved) URL ресурса, по которому клиент сопоставляет
 * серверную разметку с запрашиваемыми ресурсами и «усыновляет» (adopts) её,
 * не перезагружая и не мигая. См. `fetchResources`.
 */
export const MODULE_SSR_HREF_ATTRIBUTE = 'data-module-ssr-href';
/**
 * Атрибут `data-href` на серверных `<style>`/`<link>`-тегах стилей модуля.
 * Его проверяет CSS-рантайм module federation (порт mini-css-extract-plugin):
 * если для css-чанка уже присутствует тег с совпадающим `data-href`, рантайм
 * считает чанк загруженным и не скачивает css повторно. Именно так серверные
 * стили default-модулей «наследуются» MF-рантаймом без двойной загрузки и мигания.
 * Значение — абсолютный (resolved) URL css-файла.
 */
export const MODULE_DATA_HREF_ATTRIBUTE = 'data-href';
/**
 * Атрибут div-обёртки, в которую `createSsrMounter` рендерит стили, outlet и payload
 * модуля. Значение — `instanceId`. Клиент по нему находит серверную разметку, чтобы
 * снять с неё снапшот при гидрации.
 */
export const MODULE_SSR_ROOT_ATTRIBUTE = 'data-module-ssr-root';
/**
 * Атрибут outlet-элемента (внутри обёртки), в который смонтирован/гидрирован модуль.
 * Значение — `instanceId`.
 */
export const MODULE_SSR_MOUNT_ID_ATTRIBUTE = 'data-module-mount-id';

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
