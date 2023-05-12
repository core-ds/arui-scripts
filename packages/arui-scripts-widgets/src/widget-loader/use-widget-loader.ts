import { useCallback, useEffect, useState } from 'react';
import { LoaderFunction, LoadingState } from './types';

export function useWidgetLoader(widgetId: string, loader: LoaderFunction) {
    const [targetDiv, setTargetDiv] = useState<undefined | HTMLDivElement>();
    const [loadingState, setLoadingState] = useState<LoadingState>('unknown');
    // Мы не можем использовать useRef тут, useRef не будет тригерить ререндер, так как он не меняет ничего
    // внутри хуков. https://reactjs.org/docs/hooks-faq.html#how-can-i-measure-a-dom-node
    const afterDivMountCallback = useCallback((node: HTMLDivElement | null) => {
        if (!node) {
            return;
        }
        // мы не можем маунтить реакт-приложение в элемент, созданный другим реакт-приложением, поэтому создаем див, лежащий
        // прямо внутри нашей targetNode
        const realTarget = document.createElement('div');

        node.appendChild(realTarget);
        setTargetDiv(realTarget);
    }, []);

    useEffect(() => {
        let unmountFn: () => void | undefined;

        async function run() {
            if (!targetDiv) {
                return;
            }
            setLoadingState('pending');
            try {
                const { unmount, result } = loader(widgetId, targetDiv);

                unmountFn = unmount;
                await result;
            } catch (error) {
                setLoadingState('rejected');
                // eslint-disable-next-line no-console
                console.error(error);

                return;
            }
            setLoadingState('fulfilled');
        }

        run();

        return function appCleanUp() {
            // TODO: обновить линтеры
            // eslint-disable-next-line no-unused-expressions
            unmountFn?.();
        };
    }, [targetDiv, widgetId, loader]);

    return {
        loadingState,
        targetElementRef: afterDivMountCallback,
    };
}
