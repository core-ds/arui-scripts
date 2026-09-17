import { createBus, EventBus } from '../implementation';

type EventList = {
    testEvent: { message: string };
};

describe('EventBus', () => {
    let eventBus: EventBus<EventList>;

    beforeEach(() => {
        eventBus = new EventBus<EventList>();
    });

    it('should create EventBus with default parameters', () => {
        expect(eventBus).toBeInstanceOf(EventBus);
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

    it('should expose the dispatched detail to synchronous listeners', () => {
        const details: Array<EventList['testEvent'] | undefined> = [];

        eventBus.addEventListener('testEvent', () => {
            details.push(eventBus.getLastEventDetail('testEvent'));
        });

        eventBus.dispatchEvent('testEvent', { message: 'current message' });

        expect(details).toEqual([{ message: 'current message' }]);
    });

    it('should subscribe and return the latest detail', () => {
        const handler = jest.fn();

        eventBus.dispatchEvent('testEvent', { message: 'latest message' });

        expect(eventBus.addEventListenerAndGetLast('testEvent', handler)).toEqual({
            message: 'latest message',
        });

        eventBus.dispatchEvent('testEvent', { message: 'Next message' });
        expect(handler).toHaveBeenCalledWith(
            expect.objectContaining({ detail: { message: 'Next message' } }),
        );
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
    beforeEach(() => {
        Object.defineProperty(window, '__alfa_event_buses', {
            configurable: true,
            value: {},
            writable: true,
        });
    });

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
