import { useCallback, useEffect, useState } from 'react';

import { applyOverrides, type Override, readActiveOverrides } from '../extension/overrides';
import { readOverrides, writeOverrides } from '../utils/overrides-storage';

/**
 * Набор подмен адресов: что помнит панель и что реально перехватывает браузер.
 *
 * Состояние живёт здесь, а не во вкладке: по нему рисуется метка в заголовке вкладки,
 * а её надо видеть, не открывая саму вкладку, - забытая подмена иначе ловится как призрак.
 *
 * На старте список сверяется с браузером, а не переставляется заново. Правила живут в сессии
 * (`updateSessionRules`), перезапуск Chrome их снимает - и обещание «забытая подмена
 * не переживёт день» должно оставаться правдой, даже если панель после этого открыли.
 */
export function useOverrides(): [Override[], (next: Override[]) => void] {
    const [overrides, setOverrides] = useState<Override[]>(readOverrides);

    useEffect(() => {
        let cancelled = false;

        readActiveOverrides().then((active) => {
            // спросить некого - вне расширения; список из хранилища тогда единственное,
            // что у нас есть, и стирать его не за что
            if (cancelled || !active) {
                return;
            }

            setOverrides(active);
            writeOverrides(active);
        });

        return () => {
            cancelled = true;
        };
    }, []);

    const apply = useCallback((next: Override[]) => {
        setOverrides(next);
        writeOverrides(next);
        applyOverrides(next);
    }, []);

    return [overrides, apply];
}
