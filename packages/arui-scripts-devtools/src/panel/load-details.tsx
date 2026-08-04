import { type ReactNode } from 'react';

import { type ModuleLoadRecord } from '../contract';
import { readResourceTiming } from '../resource-timing';

import { EMPTY, formatBytes, formatDuration } from './format';
import { Waterfall } from './waterfall';

function Field({ label, value }: { label: string; value: string | undefined }) {
    return (
        <div className='field'>
            <span className='field__label'>{label}</span>
            <span className='field__value'>{value || EMPTY}</span>
        </div>
    );
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

function ResourceUrl({ url }: { url: string }) {
    const href = toSafeHref(url);

    if (!href) {
        // сам url всё равно показываем: подозрительный ресурс тем более надо видеть
        return <span className='resource__url'>{url}</span>;
    }

    return (
        <a className='resource__url' href={href} target='_blank' rel='noreferrer'>
            {url}
        </a>
    );
}

function ResourceRow({ url }: { url: string }) {
    const timing = readResourceTiming(url);
    const size = formatBytes(timing?.transferSize);

    return (
        <div className='resource'>
            <ResourceUrl url={url} />
            <span className='resource__timing'>
                {timing
                    ? [formatDuration(timing.duration), size].filter(Boolean).join(' · ')
                    : 'нет Resource Timing'}
            </span>
        </div>
    );
}

function ResourceList({ title, urls }: { title: string; urls: string[] }) {
    let items: ReactNode = <div className='resources__empty'>нет</div>;

    if (urls.length) {
        items = urls.map((url) => <ResourceRow url={url} key={url} />);
    }

    return (
        <div className='resources'>
            <div className='resources__title'>{`${title} (${urls.length})`}</div>
            {items}
        </div>
    );
}

export type LoadDetailsProps = {
    record: ModuleLoadRecord;
};

/**
 * Подробности одной попытки загрузки: то, что не влезло в строку таблицы.
 *
 * Размер ресурса показываем только когда браузер его действительно назвал: для кросс-доменных
 * модулей без Timing-Allow-Origin размера нет, и «0 КБ» было бы враньём.
 */
export function LoadDetails({ record }: LoadDetailsProps) {
    return (
        <div className='details'>
            <div className='details__meta'>
                <Field label='hostAppId' value={record.hostAppId} />
                <Field label='share scope' value={record.shareScope} />
                <Field label='манифест' value={record.manifestUrl} />
                <Field label='из кеша загрузчика' value={record.fromCache ? 'да' : 'нет'} />
                {record.mountInstrumented === undefined && record.timings.mount === undefined && (
                    // у модулей, которые разворачиваются позже (ServerStateModule, ModuleAbstract),
                    // стадию mount замерить нечем, и отсутствие времени не значит «мгновенно»
                    <Field label='стадия mount' value='не измерялась' />
                )}
            </div>
            {record.error && (
                <div className='error'>
                    <div className='error__title'>{`Ошибка на стадии «${record.error.stage}»`}</div>
                    <div className='error__message'>{record.error.message || EMPTY}</div>
                    {record.error.stack && <pre className='error__stack'>{record.error.stack}</pre>}
                </div>
            )}
            <Waterfall record={record} />
            <ResourceList title='Скрипты' urls={record.scripts} />
            <ResourceList title='Стили' urls={record.styles} />
        </div>
    );
}
