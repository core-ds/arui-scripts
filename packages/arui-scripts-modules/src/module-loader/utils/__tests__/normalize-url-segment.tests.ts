import { normalizeUrlSegment, urlSegmentWithoutEndSlash } from '../normalize-url-segment';

describe('normalizeUrlSegment', () => {
    it('should return slash for empty string', () => {
        expect(normalizeUrlSegment('')).toBe('/');
    });
    it('should return slash for falsy values', () => {
        expect(normalizeUrlSegment('')).toBe('/');
    });

    it('should append trailing slash if it is not present', () => {
        expect(normalizeUrlSegment('/test')).toBe('/test/');
    });

    it('should not append trailing slash if it is present', () => {
        expect(normalizeUrlSegment('/test/')).toBe('/test/');
    });

    it('should append leading slash if it is not present', () => {
        expect(normalizeUrlSegment('test/')).toBe('/test/');
    });

    it('should not append leading slash if it is present', () => {
        expect(normalizeUrlSegment('/test/')).toBe('/test/');
    });

    it('should not append leading slash if url is absolute', () => {
        expect(normalizeUrlSegment('http://test/')).toBe('http://test/');
    });
});

describe('urlSegmentWithoutEndSlash', () => {
    it('should return normalized url without trailing slash', () => {
        expect(urlSegmentWithoutEndSlash('/test/')).toBe('/test');
        expect(urlSegmentWithoutEndSlash('/test')).toBe('/test');
        expect(urlSegmentWithoutEndSlash('test/')).toBe('/test');
        expect(urlSegmentWithoutEndSlash('test')).toBe('/test');

        expect(urlSegmentWithoutEndSlash('http://test/')).toBe('http://test');
    });
});
