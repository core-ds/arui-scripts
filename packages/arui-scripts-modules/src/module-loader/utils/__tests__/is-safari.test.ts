import { isSafari } from '../is-safari';

describe('isSafari', () => {
    it('should return true if the user agent is Safari', () => {
        jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15',
        );

        expect(isSafari()).toBe(true);
    });

    it('should return false if the user agent is not Safari', () => {
        jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        );

        expect(isSafari()).toBe(false);
    });
});
