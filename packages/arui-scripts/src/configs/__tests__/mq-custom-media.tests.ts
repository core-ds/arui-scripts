import fs from 'fs';
import path from 'path';

const mqCssPath = path.join(__dirname, '..', 'mq.css');
const mqCss = fs.readFileSync(mqCssPath, 'utf8');

const declarations = mqCss
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('@custom-media'));

describe('mq.css custom media', () => {
    it('declares custom media for the default breakpoints', () => {
        expect(declarations.length).toBeGreaterThan(0);
    });

    it('declares every width feature with a colon', () => {
        // (min-width 64em) - невалидный media query, браузер его не матчит
        const withoutColon = declarations.filter((declaration) =>
            /\(\s*(min|max)-width\s+[^:)]/.test(declaration),
        );

        expect(withoutColon).toEqual([]);
    });

    it.each([
        ['--large', '64em'],
        ['--xlarge', '90em'],
        ['--xxlarge', '120em'],
    ])('declares %s as screen and (min-width: %s)', (name, value) => {
        expect(declarations).toContain(`@custom-media ${name} screen and (min-width: ${value});`);
    });
});
