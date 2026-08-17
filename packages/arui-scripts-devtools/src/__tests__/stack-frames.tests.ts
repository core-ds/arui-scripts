import { parseStackFrames } from '../utils/stack-frames';

describe('parseStackFrames', () => {
    it('should keep every line of the stack', () => {
        const frames = parseStackFrames('Error: boom\n    at first\n    at second');

        expect(frames.map((frame) => frame.text)).toEqual([
            'Error: boom',
            '    at first',
            '    at second',
        ]);
    });

    it('should pick up the location of a named frame', () => {
        const [frame] = parseStackFrames(
            '    at mountModule (http://localhost:8080/assets/main.js:120:15)',
        );

        expect(frame.url).toBe('http://localhost:8080/assets/main.js');
        // DevTools считает строки с нуля, а рантайм - с единицы
        expect(frame.line).toBe(119);
    });

    it('should pick up the location of an anonymous frame', () => {
        const [frame] = parseStackFrames('    at http://localhost:8082/assets/module.js:4:9');

        expect(frame.url).toBe('http://localhost:8082/assets/module.js');
        expect(frame.line).toBe(3);
    });

    it('should not go below the first line', () => {
        const [frame] = parseStackFrames('    at http://localhost/main.js:0:0');

        expect(frame.line).toBe(0);
    });

    it('should leave a frame without a location as plain text', () => {
        const [frame] = parseStackFrames('    at Array.forEach (<anonymous>)');

        expect(frame.url).toBeUndefined();
        expect(frame.line).toBeUndefined();
    });

    it('should not linkify schemes devtools cannot open', () => {
        // webpack-internal:, chrome-extension: и прочее в Sources не открывается,
        // а нерабочая ссылка хуже её отсутствия
        const [frame] = parseStackFrames('    at eval (webpack-internal:///./src/index.ts:12:3)');

        expect(frame.url).toBeUndefined();
    });

    it('should survive an empty stack', () => {
        expect(parseStackFrames('')).toEqual([{ text: '' }]);
    });
});
