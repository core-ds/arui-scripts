import { readStoreState, watchModulesStore } from './store-client';
import { type PanelSource } from './types';

/**
 * Источник данных для панели, инжектнутой в саму страницу: стор лежит в том же окне,
 * читать его можно напрямую и подписываться тоже.
 */
export const pageSource: PanelSource = {
    getInitialState: readStoreState,
    subscribe: watchModulesStore,
};
