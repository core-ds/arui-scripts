import { getConsumerCounter } from '../consumers-counter';

describe('ConsumersCounter', () => {
    it('getCounter should return 0 if module never get increased', () => {
        const counter = getConsumerCounter();

        expect(counter.getCounter('test')).toBe(0);
    });

    it('getCounter should return consume counter if module get increased', () => {
        const counter = getConsumerCounter();

        counter.increase('test');
        expect(counter.getCounter('test')).toBe(1);
    });

    it('getCounter should return 0 if module get increased and decreased', () => {
        const counter = getConsumerCounter();

        counter.increase('test');
        counter.decrease('test');
        expect(counter.getCounter('test')).toBe(0);
    });
});
