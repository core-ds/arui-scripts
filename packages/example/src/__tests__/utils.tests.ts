import { isSmaller, YesNoEnum } from '../utils';

describe('isSmaller', () => {
    it('should return no if a not greater than b', () => {
        const result = isSmaller(1, 2);

        expect(result).toBe(YesNoEnum.No);
    });

    it('should return yes if a > b', () => {
        const result = isSmaller(2, 1);

        expect(result).toBe(YesNoEnum.Yes);
    });
});
