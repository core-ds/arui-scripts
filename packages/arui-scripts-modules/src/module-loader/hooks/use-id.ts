import React from 'react';
import { v4 } from 'uuid';

type ReactWithUseId = typeof React & {
    useId: () => string;
};

export const useId = (React as ReactWithUseId).useId || function useUuid() {
    /*
     * Utilize useState instead of useMemo because React
     * makes no guarantees that the memo store is durable
     */
    const id = React.useState(() => v4())[0];

    return id;
};
