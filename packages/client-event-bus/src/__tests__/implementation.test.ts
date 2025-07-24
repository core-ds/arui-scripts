import { createBus, EventBus } from '../implementation';

type EventList = {
    testEvent: { message: string };
};

describe('EventBus', () => {
    let eventBus: EventBus<EventList>;

    beforeEach(() => {
        eventBus = new EventBus<EventList>({ debugMode: true });
    });

    it('should create EventBus with default parameters', () => {
        expect(eventBus).toBeDefined();
        expect(eventBus).toHaveProperty('targetNode');
        expect(eventBus).toHaveProperty('debugMode', true);
    });

    it('should dispatch an event and capture it', () => {
        const handler = jest.fn();

        eventBus.addEventListener<'testEvent', EventList['testEvent']>('testEvent', handler);
        eventBus.dispatchEvent('testEvent', { message: 'Test Message' });

        expect(handler).toHaveBeenCalled();
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ detail: { message: 'Test Message' } }),
        );
        expect(eventBus.getLastEventDetail('testEvent')).toEqual({ message: 'Test Message' });
    });

    it('should return last event detail', () => {
        eventBus.dispatchEvent('testEvent', { message: 'Test Message' });

        const detail = eventBus.getLastEventDetail('testEvent');

        expect(detail).toEqual({ message: 'Test Message' });
    });

    it('should add and remove event listeners', () => {
        const handler = jest.fn();

        eventBus.addEventListener('testEvent', handler);
        eventBus.dispatchEvent('testEvent', { message: 'Hello!' });

        expect(handler).toHaveBeenCalled();

        eventBus.removeEventListener('testEvent', handler);
        eventBus.dispatchEvent('testEvent', { message: 'Goodbye!' });

        expect(handler).not.toHaveBeenCalledTimes(2);
    });
});

describe('createBus', () => {
    it('should create and return the same EventBus instance for the same key', () => {
        const eventBus1 = createBus('eventBus');
        const eventBus2 = createBus('eventBus');

        expect(eventBus1).toBe(eventBus2);
    });

    it('should create different EventBus instances for different keys', () => {
        const eventBus1 = createBus('eventBus1');
        const eventBus2 = createBus('eventBus2');

        expect(eventBus1).not.toBe(eventBus2);
    });
});
