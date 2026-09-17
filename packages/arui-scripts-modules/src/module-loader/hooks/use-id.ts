import React from 'react';

type ReactWithUseId = typeof React & {
    useId: () => string;
};

let idCounter = 0;

function generateId() {
    idCounter += 1;

    return `arui-module-${idCounter}`;
}

export const useId =
    (React as ReactWithUseId).useId ||
    function useCounterId() {
        /*
         * Utilize useState instead of useMemo because React
         * makes no guarantees that the memo store is durable
         */
        const id = React.useState(generateId)[0];

        return id;
    };
