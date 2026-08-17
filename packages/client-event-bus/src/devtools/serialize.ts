/** сколько символов нагрузки везём в контракт: дальше читать всё равно нечего */
const MAX_PAYLOAD_LENGTH = 10000;

/**
 * Приводит нагрузку события к тому, что можно положить в контракт.
 *
 * В шину кладут что угодно - DOM-ноды, функции, циклические структуры, инстансы классов, -
 * а контракт обещает читателям только сериализуемые данные: снимок уезжает в расширение
 * браузера структурным клоном, и функция в нём уронила бы весь ответ.
 *
 * @returns значение и признак того, что вместо него пришлось положить описание
 */
export function serializePayload(payload: unknown): { value: unknown; omitted: boolean } {
    if (payload === undefined || payload === null) {
        return { value: payload, omitted: false };
    }

    const type = typeof payload;

    if (type === 'string' || type === 'number' || type === 'boolean') {
        return { value: payload, omitted: false };
    }

    if (type === 'function') {
        return { value: '[function]', omitted: true };
    }

    try {
        const json = JSON.stringify(payload);

        if (json === undefined) {
            return { value: `[${type}]`, omitted: true };
        }

        if (json.length > MAX_PAYLOAD_LENGTH) {
            return { value: `${json.slice(0, MAX_PAYLOAD_LENGTH)}… (обрезано)`, omitted: true };
        }

        return { value: JSON.parse(json), omitted: false };
    } catch {
        // циклическая структура, DOM-нода или getter, который бросает
        return { value: `[${type}, несериализуемо]`, omitted: true };
    }
}
