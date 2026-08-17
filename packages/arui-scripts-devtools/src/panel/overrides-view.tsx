import { useEffect, useState } from 'react';

import {
    applyOverrides,
    hasOriginPermission,
    isValidOverride,
    type Override,
    requestOriginPermission,
} from '../extension/overrides';
import { type OverridesViewProps } from '../types';
import { readOverrides, writeOverrides } from '../utils/overrides-storage';

/** origin провайдера из адреса, который загрузчик записал в диагностику */
function toOrigin(url: string | undefined): string | undefined {
    if (!url) {
        return undefined;
    }

    try {
        return new URL(url).origin;
    } catch {
        return undefined;
    }
}

/**
 * Вкладка «Подмена»: перенаправление адресов провайдеров на локальные дев-серверы.
 *
 * Единственное, чего инжектнутая панель не могла в принципе: перехват сетевых запросов -
 * привилегия расширения. Ради этого сценария всё и затевалось - проверить правку в модуле
 * на реальном стенде, не собирая и не выкладывая его.
 *
 * Правила живут в сессии браузера: перезапуск Chrome их снимает, и забытая подмена
 * не переживёт день.
 */
export function OverridesView({ origins }: OverridesViewProps) {
    const [overrides, setOverrides] = useState<Override[]>(readOverrides);
    const [note, setNote] = useState<string>();

    // правила ставятся заново на каждое изменение: набор подмен - это состояние,
    // и держать его в одном месте проще, чем сводить дельты
    useEffect(() => {
        writeOverrides(overrides);
        applyOverrides(overrides);
    }, [overrides]);

    const setTarget = (from: string, to: string) => {
        setOverrides((previous) => {
            const rest = previous.filter((item) => item.from !== from);

            return to ? [...rest, { from, to }] : rest;
        });
    };

    const enable = async (from: string, to: string) => {
        const granted = (await hasOriginPermission(from)) || (await requestOriginPermission(from));

        if (!granted) {
            setNote(
                `Без доступа к ${from} подменить его нельзя: Chrome не даст перехватить запрос.`,
            );

            return;
        }

        setNote(undefined);
        setTarget(from, to);
    };

    if (!origins.length) {
        return (
            <div className='overrides'>
                <div className='placeholder'>
                    Подменять пока нечего: ни один модуль ещё не загружался, и адресов провайдеров
                    мы не знаем.
                </div>
            </div>
        );
    }

    return (
        <div className='overrides'>
            <div className='overrides__hint'>
                Адрес провайдера перенаправляется на локальный дев-сервер: путь модуля остаётся
                прежним, меняются только схема, хост и порт. Правила живут до перезапуска браузера.
            </div>
            {note && <div className='overrides__note'>{note}</div>}
            {origins.map((origin) => {
                const current = overrides.find((item) => item.from === origin);
                const value = current?.to ?? '';
                const invalid = Boolean(value) && !isValidOverride({ from: origin, to: value });

                return (
                    <div className='overrides__row' key={origin}>
                        <span className='overrides__from' title={origin}>
                            {origin}
                        </span>
                        <span className='overrides__arrow'>→</span>
                        <input
                            className={`search overrides__to${
                                invalid ? ' overrides__to_invalid' : ''
                            }`}
                            type='url'
                            placeholder='http://localhost:8082'
                            value={value}
                            onChange={(event) => setTarget(origin, event.target.value)}
                        />
                        <button
                            type='button'
                            className='button'
                            disabled={!value || invalid}
                            onClick={() => enable(origin, value)}
                        >
                            {current ? 'Обновить' : 'Включить'}
                        </button>
                        <button
                            type='button'
                            className='button button_icon'
                            title='Убрать подмену'
                            aria-label={`Убрать подмену ${origin}`}
                            disabled={!current}
                            onClick={() => setTarget(origin, '')}
                        >
                            ✕
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

export { toOrigin };
