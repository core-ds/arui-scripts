import React, { useEffect, useState } from 'react';

import { createBus } from '@alfalab/client-event-bus';
import { Button } from '@alfalab/core-components/button';
import { Gap } from '@alfalab/core-components/gap';
import { Typography } from '@alfalab/core-components/typography';

// createBus, а не getEventBus: второй только читает реестр уже созданных шин
const bus = createBus('example');

/**
 * Небольшой стенд событийной шины: видно, как события и подписки попадают
 * во вкладку Event bus расширения отладки.
 *
 * Второе событие нарочно без подписчиков - именно так выглядит самая частая проблема,
 * ради которой вкладка и нужна: отправили, а никто не отреагировал.
 */
export function EventBusDemo() {
    const [lastGreeting, setLastGreeting] = useState<string>();

    useEffect(() => {
        const handler = (event: CustomEvent<{ from: string }>) => {
            setLastGreeting(event.detail?.from);
        };

        bus.addEventListener('example:greeting', handler);

        return () => bus.removeEventListener('example:greeting', handler);
    }, []);

    return (
        <div>
            <Typography.Title tag='h2' view='xsmall'>
                Событийная шина
            </Typography.Title>
            <Gap size='s' />
            <Button
                size='xxs'
                onClick={() => bus.dispatchEvent('example:greeting', { from: 'кнопка' })}
            >
                Событие со слушателем
            </Button>{' '}
            <Button
                size='xxs'
                view='secondary'
                onClick={() => bus.dispatchEvent('example:nobody-listens', { at: Date.now() })}
            >
                Событие без слушателей
            </Button>
            <Gap size='s' />
            <Typography.Text view='primary-small'>
                {lastGreeting ? `Последнее приветствие от: ${lastGreeting}` : 'Событий ещё не было'}
            </Typography.Text>
        </div>
    );
}
