import { type DevtoolsEvent } from '../types';
import { matchesEvent } from '../utils/event-matches';

function createEvent(overrides: Partial<DevtoolsEvent> = {}): DevtoolsEvent {
    return {
        id: 1,
        type: 'load-start',
        loadId: 'load-1',
        moduleId: 'header',
        timestamp: 0,
        time: 0,
        ...overrides,
    };
}

describe('matchesEvent', () => {
    it('should match everything when the query is empty', () => {
        expect(matchesEvent(createEvent(), '')).toBe(true);
    });

    it('should match by module id', () => {
        expect(matchesEvent(createEvent({ moduleId: 'header' }), 'head')).toBe(true);
        expect(matchesEvent(createEvent({ moduleId: 'header' }), 'footer')).toBe(false);
    });

    it('should match by event type', () => {
        expect(matchesEvent(createEvent({ type: 'unmount' }), 'unmount')).toBe(true);
    });

    it('should match by stage', () => {
        expect(matchesEvent(createEvent({ stage: 'fetch-manifest' }), 'manifest')).toBe(true);
    });

    it('should match by message', () => {
        expect(matchesEvent(createEvent({ message: 'Failed to fetch' }), 'failed')).toBe(true);
    });

    it('should ignore fields the event does not have', () => {
        // у события без стадии и сообщения искать не в чем, но падать оно не должно
        expect(matchesEvent(createEvent(), 'manifest')).toBe(false);
    });

    it('should expect the query to be lowercased by the caller', () => {
        // приведение делает вызывающий: панель нормализует строку один раз на кадр,
        // а не на каждое событие
        expect(matchesEvent(createEvent({ moduleId: 'Header' }), 'header')).toBe(true);
    });
});
