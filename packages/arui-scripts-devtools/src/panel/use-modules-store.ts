import { useEffect, useState } from 'react';

import { type DevtoolsState, type PanelSource } from '../types';

/**
 * Состояние всех неймспейсов контракта для React-дерева панели.
 *
 * Откуда данные - решает источник: расширение спрашивает страницу через
 * `chrome.devtools.inspectedWindow.eval`. Панель об этом не знает.
 */
export function useModulesStore(source: PanelSource): DevtoolsState {
    const [state, setState] = useState<DevtoolsState>(source.getInitialState);

    useEffect(() => source.subscribe(setState), [source]);

    return state;
}
