import { useEffect, useState } from 'react';

import { type ModulesStoreState, type PanelSource } from '../types';

/**
 * Состояние стора для React-дерева панели.
 *
 * Откуда данные - решает источник: инжектнутая панель читает глобал напрямую, расширение
 * браузера ходит через `chrome.devtools.inspectedWindow.eval`. Панель об этом не знает.
 */
export function useModulesStore(source: PanelSource): ModulesStoreState {
    const [state, setState] = useState<ModulesStoreState>(source.getInitialState);

    useEffect(() => source.subscribe(setState), [source]);

    return state;
}
