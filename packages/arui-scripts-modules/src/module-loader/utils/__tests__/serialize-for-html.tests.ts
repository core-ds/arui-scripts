import { serializeForHtml } from '../serialize-for-html';

describe('serializeForHtml', () => {
    it('should produce valid JSON that round-trips through JSON.parse', () => {
        const value = { scripts: ['a.js'], moduleState: { baseUrl: '/', nested: [1, 2, 3] } };

        expect(JSON.parse(serializeForHtml(value))).toEqual(value);
    });

    it('should escape < > & to prevent </script> breakout', () => {
        const result = serializeForHtml({ html: '</script><script>alert(1)</script>' });

        expect(result).not.toContain('<');
        expect(result).not.toContain('>');
        expect(result).not.toContain('&');
        expect(result).toContain('\\u003c');
        expect(result).toContain('\\u003e');
    });

    it('should keep the escaped value semantically identical after parsing', () => {
        const value = { html: '</script><script>alert(1)</script>' };

        expect(JSON.parse(serializeForHtml(value))).toEqual(value);
    });

    it('should escape ampersands', () => {
        const result = serializeForHtml({ query: 'a=1&b=2' });

        expect(result).not.toContain('&');
        expect(result).toContain('\\u0026');
        expect(JSON.parse(result)).toEqual({ query: 'a=1&b=2' });
    });

    it('should escape line and paragraph separators U+2028/U+2029', () => {
        const lineSeparator = String.fromCharCode(0x2028);
        const paragraphSeparator = String.fromCharCode(0x2029);
        const value = { text: `line${lineSeparator}para${paragraphSeparator}end` };

        const result = serializeForHtml(value);

        expect(result).not.toContain(lineSeparator);
        expect(result).not.toContain(paragraphSeparator);
        expect(result).toContain('\\u2028');
        expect(result).toContain('\\u2029');
        expect(JSON.parse(result)).toEqual(value);
    });

    it('should not alter values without special characters', () => {
        const value = { a: 1, b: 'plain string', c: true };

        expect(serializeForHtml(value)).toBe(JSON.stringify(value));
    });
});
