import { useEffect, useState } from 'react';

import { readStoreState, watchModulesStore } from '../store-client';
import { type ModulesStoreState } from '../types';

/**
 * Состояние стора загрузчика для React-дерева панели.
 *
 * Вся сложность — поллинг до появления стора, разбор версий, отписка — уже решена
 * в `watchModulesStore`, хук только заводит её результат в состояние. Первый кадр
 * приходит синхронно при подписке, поэтому initial-значение почти сразу перезаписывается.
 */
export function useModulesStore(): ModulesStoreState {
    const [state, setState] = useState<ModulesStoreState>(readStoreState);

    useEffect(() => watchModulesStore(setState), []);

    return state;
}
