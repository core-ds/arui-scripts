import { type ModuleLoadRecord } from '../contract';
import { readResourceTiming } from '../resource-timing';

import { createElement } from './dom';
import { EMPTY, formatBytes, formatDuration } from './format';
import { createWaterfall } from './waterfall';

function createField(label: string, value: string | undefined) {
    const field = createElement('div', 'field');

    field.appendChild(createElement('span', 'field__label', label));
    field.appendChild(createElement('span', 'field__value', value || EMPTY));

    return field;
}

/**
 * Ссылку делаем только на то, что браузер откроет как страницу.
 *
 * `href` исполняет и `javascript:`, а url приезжает из манифеста, то есть снаружи. Правами это
 * никого не наделяет - кто пишет манифест, тот и так получает произвольный `<script src>`
 * в origin приложения, - но панель не обязана добавлять к этому ещё один способ.
 *
 * @returns абсолютный url или undefined, если открывать его не стоит
 */
function toSafeHref(url: string): string | undefined {
    try {
        // относительный путь - обычное дело для модуля с того же origin, поэтому с базой
        const { protocol, href } = new URL(url, document.baseURI);

        return protocol === 'http:' || protocol === 'https:' ? href : undefined;
    } catch {
        return undefined;
    }
}

function createUrlElement(url: string) {
    const href = toSafeHref(url);

    if (!href) {
        // сам url всё равно показываем: подозрительный ресурс тем более надо видеть
        return createElement('span', 'resource__url', url);
    }

    const link = createElement('a', 'resource__url', url);

    link.href = href;
    link.target = '_blank';
    link.rel = 'noreferrer';

    return link;
}

function createResourceRow(url: string) {
    const row = createElement('div', 'resource');
    const link = createUrlElement(url);

    const timing = readResourceTiming(url);
    const size = formatBytes(timing?.transferSize);

    row.appendChild(link);
    row.appendChild(
        createElement(
            'span',
            'resource__timing',
            timing
                ? [formatDuration(timing.duration), size].filter(Boolean).join(' · ')
                : 'нет Resource Timing',
        ),
    );

    return row;
}

function createResourceList(title: string, urls: string[]) {
    const block = createElement('div', 'resources');

    block.appendChild(createElement('div', 'resources__title', `${title} (${urls.length})`));

    if (!urls.length) {
        block.appendChild(createElement('div', 'resources__empty', 'нет'));

        return block;
    }

    urls.forEach((url) => block.appendChild(createResourceRow(url)));

    return block;
}

function createErrorBlock(record: ModuleLoadRecord) {
    const error = createElement('div', 'error');

    error.appendChild(
        createElement('div', 'error__title', `Ошибка на стадии «${record.error?.stage}»`),
    );
    error.appendChild(createElement('div', 'error__message', record.error?.message || EMPTY));

    if (record.error?.stack) {
        error.appendChild(createElement('pre', 'error__stack', record.error.stack));
    }

    return error;
}

/**
 * Подробности одной попытки загрузки: то, что не влезло в строку таблицы.
 *
 * Размер ресурса показываем только когда браузер его действительно назвал: для кросс-доменных
 * модулей без Timing-Allow-Origin размера нет, и «0 КБ» было бы враньём.
 */
export function createLoadDetails(record: ModuleLoadRecord): HTMLElement {
    const details = createElement('div', 'details');
    const meta = createElement('div', 'details__meta');

    meta.appendChild(createField('hostAppId', record.hostAppId));
    meta.appendChild(createField('share scope', record.shareScope));
    meta.appendChild(createField('манифест', record.manifestUrl));
    meta.appendChild(createField('из кеша загрузчика', record.fromCache ? 'да' : 'нет'));

    if (record.mountInstrumented === undefined && record.timings.mount === undefined) {
        // у модулей, которые разворачиваются позже (ServerStateModule, ModuleAbstract),
        // стадию mount замерить нечем, и отсутствие времени тут не значит «мгновенно»
        meta.appendChild(createField('стадия mount', 'не измерялась'));
    }

    details.appendChild(meta);

    if (record.error) {
        details.appendChild(createErrorBlock(record));
    }

    details.appendChild(createWaterfall(record));
    details.appendChild(createResourceList('Скрипты', record.scripts));
    details.appendChild(createResourceList('Стили', record.styles));

    return details;
}
