import React, { createContext, useContext, useMemo, useRef } from 'react';

import { type CacheEntry } from './suspense-resource-cache';

export type ModuleSsrRequest = {
    requestId: string;
    cache: Map<string, CacheEntry<unknown>>;
};

const SsrRequestContext = createContext<ModuleSsrRequest | undefined>(undefined);

/**
 * Провайдер per-request кэша серверного рендеринга модулей.
 *
 * Хост создаёт его на каждый HTTP-запрос с уникальным `requestId` (например,
 * `crypto.randomUUID()`) и передаёт `requestId` пропом — НЕ генерирует его внутри
 * рендера (Suspense throw→retry мог бы поменять его и сбросить кэш посередине рендера).
 *
 * Провайдер не рендерит DOM (оборачивает children без ноды), поэтому он
 * hydration-transparent: добавлять его нужно только в серверную точку входа хоста.
 * Кэш живёт в рамках запроса и умирает вместе с ним (GC). При смене `requestId`
 * кэш пересоздаётся.
 */
export function ModuleSsrRequestProvider({
    requestId,
    children,
}: {
    requestId: string;
    children?: React.ReactNode;
}) {
    const cacheRef = useRef<{ requestId: string; cache: Map<string, CacheEntry<unknown>> } | null>(
        null,
    );

    if (!cacheRef.current || cacheRef.current.requestId !== requestId) {
        cacheRef.current = { requestId, cache: new Map() };
    }

    const value = useMemo<ModuleSsrRequest>(
        () => ({ requestId, cache: cacheRef.current!.cache }),
        [requestId],
    );

    return <SsrRequestContext.Provider value={value}>{children}</SsrRequestContext.Provider>;
}

export function useModuleSsrRequestContext(): ModuleSsrRequest {
    const context = useContext(SsrRequestContext);

    if (!context) {
        throw new Error(
            'createSsrMounter: для серверного рендеринга модуля оберните дерево в ' +
                '<ModuleSsrRequestProvider requestId="..."> с уникальным requestId на каждый ' +
                'HTTP-запрос хоста.',
        );
    }

    return context;
}
