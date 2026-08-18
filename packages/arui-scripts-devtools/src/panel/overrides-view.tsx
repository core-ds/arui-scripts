import { useState } from 'react';

import {
    hasOriginPermission,
    isValidOverride,
    requestOriginPermission,
} from '../extension/overrides';
import { type OverridesViewProps } from '../types';

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
 *
 * Сам набор подмен держит панель: по нему она рисует метку в заголовке вкладки, а метку
 * надо видеть, не открывая вкладку.
 */
export function OverridesView({ origins, overrides, onChange }: OverridesViewProps) {
    const [note, setNote] = useState<string>();
    // Набранное в поле - это ещё не подмена. Пока правило не включили кнопкой, трафик
    // идти не должен: иначе адрес начинает перехватываться по мере набора, на середине
    // слова, и пользователь узнаёт об этом по сломавшейся странице.
    const [drafts, setDrafts] = useState<Record<string, string>>({});

    const getTarget = (from: string) =>
        drafts[from] ?? overrides.find((item) => item.from === from)?.to ?? '';

    const setDraft = (from: string, to: string) => {
        setDrafts((previous) => ({ ...previous, [from]: to }));
    };

    const remove = (from: string) => {
        setDrafts((previous) => ({ ...previous, [from]: '' }));
        onChange(overrides.filter((item) => item.from !== from));
    };

    const enable = async (from: string, to: string) => {
        // доступ к origin просим ровно в этот момент и только к нему: до включения подмены
        // расширение не имеет прав ни на одну страницу
        const granted = (await hasOriginPermission(from)) || (await requestOriginPermission(from));

        if (!granted) {
            setNote(
                `Без доступа к ${from} подменить его нельзя: Chrome не даст перехватить запрос.`,
            );

            return;
        }

        setNote(undefined);
        // весь набор целиком, а не дельта: подмены - это состояние, и держать его
        // в одном месте проще, чем сводить изменения
        onChange([...overrides.filter((item) => item.from !== from), { from, to }]);
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
                const value = getTarget(origin);
                const invalid = Boolean(value) && !isValidOverride({ from: origin, to: value });
                const active = Boolean(current) && current?.to === value;

                return (
                    <div className='overrides__row' key={origin}>
                        <span className='overrides__from' title={origin}>
                            {origin}
                            {current && (
                                <span className='badge badge_active' title='Подмена включена'>
                                    включена
                                </span>
                            )}
                        </span>
                        <span className='overrides__arrow'>→</span>
                        <input
                            className={`search overrides__to${
                                invalid ? ' overrides__to_invalid' : ''
                            }`}
                            type='url'
                            placeholder='http://localhost:8082'
                            value={value}
                            onChange={(event) => setDraft(origin, event.target.value)}
                        />
                        <button
                            type='button'
                            className='button'
                            disabled={!value || invalid || active}
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
                            onClick={() => remove(origin)}
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
