import React from 'react';
import { v4 } from 'uuid';

export const useId = (React as any).useId || function useUuid() {
    /*
     * Utilize useState instead of useMemo because React
     * makes no guarantees that the memo store is durable
     */
    const id = React.useState(() => v4())[0];

    return id;
};
