import { type DevtoolsEvent } from '../types';

/** попадает ли событие под текстовый фильтр: модуль, тип, стадия или сообщение */
export function matchesEvent(event: DevtoolsEvent, query: string): boolean {
    if (!query) {
        return true;
    }

    return [event.moduleId, event.type, event.stage, event.message]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
}
