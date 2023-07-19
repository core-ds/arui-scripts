import { ConsumersCounter, resetConsumersCounter } from '../consumers-counter';

describe('ConsumersCounter', () => {
    beforeEach(() => {
        resetConsumersCounter();
    });

    it('isAbsent should return true if module never get increased', () => {
        const counter = new ConsumersCounter('test');
        expect(counter.isAbsent()).toBe(true);
    });

    it('isAbsent should return false if module get increased', () => {
        const counter = new ConsumersCounter('test');
        counter.increase();
        expect(counter.isAbsent()).toBe(false);
    });

    it('isAbsent should return true if module get increased and decreased', () => {
        const counter = new ConsumersCounter('test');
        counter.increase();
        counter.decrease();
        expect(counter.isAbsent()).toBe(true);
    });
});
