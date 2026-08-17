import { type ModuleLoadRecord } from '../types';
import { getScaleEnd } from '../utils/waterfall-scale';

function createRecord(startedAt: number): ModuleLoadRecord {
    return {
        loadId: 'load-1',
        moduleId: 'header',
        hostAppId: 'host',
        status: 'pending',
        shareScope: 'default',
        fromCache: false,
        scripts: [],
        styles: [],
        timings: {},
        startedAt,
    };
}

describe('getScaleEnd', () => {
    const originalNow = performance.now;

    afterEach(() => {
        performance.now = originalNow;
    });

    it('should end the scale at the last mark when everything has finished', () => {
        performance.now = (() => 5000) as typeof performance.now;

        expect(getScaleEnd(createRecord(performance.timeOrigin + 1), 300, false)).toBe(300);
    });

    it('should stretch the scale to now while a stage is still running', () => {
        // иначе полоска незавершённой стадии вырождается в засечку у правого края -
        // ровно там, где водопад и открывают, чтобы увидеть, на чём модуль висит
        performance.now = (() => 900) as typeof performance.now;

        expect(getScaleEnd(createRecord(performance.timeOrigin + 1), 300, true)).toBe(900);
    });

    it('should not shrink the scale below the last mark', () => {
        // «сейчас» не может оказаться раньше последней засечки, но если часы подменили -
        // шкала всё равно обязана вместить все стадии
        performance.now = (() => 100) as typeof performance.now;

        expect(getScaleEnd(createRecord(performance.timeOrigin + 1), 300, true)).toBe(300);
    });

    it('should ignore now for records of a previous page load', () => {
        // у восстановленной из sessionStorage записи своё начало отсчёта: текущий
        // performance.now() к её шкале не относится вовсе
        performance.now = (() => 100000) as typeof performance.now;

        expect(getScaleEnd(createRecord(performance.timeOrigin - 1), 300, true)).toBe(300);
    });

    it('should survive a performance without now', () => {
        // @ts-expect-error проверяем поведение в окружении без performance.now
        performance.now = undefined;

        expect(getScaleEnd(createRecord(0), 300, true)).toBe(300);
    });
});
