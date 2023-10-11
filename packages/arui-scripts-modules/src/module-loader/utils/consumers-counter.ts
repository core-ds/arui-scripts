export function getConsumerCounter() {
    const counters: Record<string, number> = {};

    function ensureCounter(moduleId: string) {
        if (!Object.prototype.hasOwnProperty.call(counters, moduleId)) {
            counters[moduleId] = 0;
        }
    }

    return {
        increase(moduleId: string) {
            ensureCounter(moduleId);
            counters[moduleId] += 1;
        },
        decrease(moduleId: string) {
            ensureCounter(moduleId);
            if (counters[moduleId] > 0) {
                counters[moduleId] -= 1;
            }
        },
        getCounter(moduleId: string) {
            ensureCounter(moduleId);

            return counters[moduleId];
        }
    };
}

export type ConsumersCounter = ReturnType<typeof getConsumerCounter>;
