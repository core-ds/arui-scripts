import { scopeStyles } from '../scope-styles';

describe('scopeStyles', () => {
    it('should prefix a plain selector with the scope', () => {
        expect(scopeStyles('.panel { color: red; }', '#root')).toContain('#root .panel {');
    });

    it('should replace :host with the scope itself', () => {
        const css = scopeStyles(':host { all: initial; }', '#root');

        expect(css).toContain('#root {');
        expect(css).not.toContain(':host');
    });

    it('should prefix every selector of a group', () => {
        expect(scopeStyles('.tab, .button { color: red; }', '#root')).toContain(
            '#root .tab, #root .button {',
        );
    });

    it('should leave declarations untouched', () => {
        // в значениях есть и запятые, и скобки - разбор селекторов не должен до них добираться
        const css = scopeStyles(
            '.bar { background: repeating-linear-gradient(90deg, #fff, #000 4px); }',
            '#root',
        );

        expect(css).toContain('repeating-linear-gradient(90deg, #fff, #000 4px)');
        expect(css).not.toContain('#root #fff');
    });

    it('should scope the rules inside a conditional at-rule', () => {
        const css = scopeStyles('@media (max-width: 100px) { .panel { color: red; } }', '#root');

        expect(css).toContain('@media (max-width: 100px) {');
        expect(css).toContain('#root .panel {');
    });

    it('should not touch the keyframes of an animation', () => {
        // внутри @keyframes не селекторы, а точки прогресса: `#root from` не значит ничего
        const css = scopeStyles(
            '@keyframes blink { from { opacity: 0; } to { opacity: 1; } }',
            '#root',
        );

        expect(css).toContain('@keyframes blink {');
        expect(css).not.toContain('#root from');
    });

    it('should not mistake a comment before a rule for part of its selector', () => {
        // комментарий приезжает в тот же кусок текста, что и селектор, а запятая внутри него
        // разваливает правило на несколько нерабочих
        const css = scopeStyles('/* заметка, с запятой */\n.panel { color: red; }', '#root');

        expect(css).toContain('#root .panel {');
        expect(css).not.toContain('заметка');
    });

    it('should survive css it cannot parse', () => {
        expect(() => scopeStyles('.broken { color: red', '#root')).not.toThrow();
    });
});
