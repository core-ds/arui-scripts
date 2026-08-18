import { getScaleEnd } from '../utils/waterfall-scale';

describe('getScaleEnd', () => {
    it('should end the scale at the last mark when everything has finished', () => {
        expect(getScaleEnd(300, false, 5000)).toBe(300);
    });

    it('should stretch the scale to now while a stage is still running', () => {
        // иначе полоска незавершённой стадии вырождается в засечку у правого края -
        // ровно там, где водопад и открывают, чтобы увидеть, на чём модуль висит
        expect(getScaleEnd(300, true, 900)).toBe(900);
    });

    it('should not shrink the scale below the last mark', () => {
        // «сейчас» не может оказаться раньше последней засечки, но если часы подменили -
        // шкала всё равно обязана вместить все стадии
        expect(getScaleEnd(300, true, 100)).toBe(300);
    });

    it('should ignore a missing now', () => {
        // «сейчас» неизвестно у записей прошлой загрузки страницы и пока страница молчит:
        // в обоих случаях край шкалы - последняя засечка, а не выдуманное время
        expect(getScaleEnd(300, true, undefined)).toBe(300);
    });

    it('should ignore a now that is not a number', () => {
        expect(getScaleEnd(300, true, Number.NaN)).toBe(300);
    });
});
