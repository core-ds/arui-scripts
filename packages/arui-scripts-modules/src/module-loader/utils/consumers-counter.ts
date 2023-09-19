// TODO: remove eslint-disable-next-line
const counters: Record<string, number> = {};

export class ConsumersCounter {
    moduleId: string;

    constructor(moduleId: string) {
        this.moduleId = moduleId;

        // eslint-disable-next-line no-prototype-builtins
        if (!counters.hasOwnProperty(moduleId)) {
            counters[moduleId] = 0;
        }
    }

    isAbsent() {
        return counters[this.moduleId] === 0;
    }

    increase() {
        counters[this.moduleId] += 1;
    }

    decrease() {
        if (counters[this.moduleId] > 0) {
            counters[this.moduleId] -= 1;
        }
    }
}

export const resetConsumersCounter = () => {
    Object.keys(counters).forEach((moduleId) => {
        counters[moduleId] = 0;
    });
};
