import postcss from 'postcss';

import { postCssPrefix } from '../postcss-prefix-selector';

describe('module CSS isolation', () => {
    test('prefixes selector lists and scopes CSS variables', async () => {
        const result = await postcss([postCssPrefix({ prefix: '.module ' })]).process(
            ':root{--color:red}.a,.b:hover{color:var(--color)}',
            { from: undefined },
        );

        expect(result.css).toBe(
            '.module {--color:red}.module .a,.module .b:hover{color:var(--color)}',
        );
    });
    test.each(['keyframes', '-webkit-keyframes', '-moz-keyframes', '-o-keyframes'])(
        'does not prefix %s animation steps',
        async (keyword) => {
            const result = await postcss([postCssPrefix({ prefix: '.module ' })]).process(
                `@${keyword} fade{from{opacity:0}50%{opacity:.5}to{opacity:1}}.a{animation:fade}`,
                { from: undefined },
            );

            expect(result.css).toBe(
                `@${keyword} fade{from{opacity:0}50%{opacity:.5}to{opacity:1}}.module .a{animation:fade}`,
            );
        },
    );
    test('prefixes media rules without double-prefixing nested selectors', async () => {
        const result = await postcss([postCssPrefix({ prefix: '.module ' })]).process(
            '@media print{.a{&:hover{color:red}}}',
            { from: undefined },
        );

        expect(result.css).toBe('@media print{.module .a{&:hover{color:red}}}');
    });
    test('supports default prefix and processing the same root again', async () => {
        const processor = postcss([postCssPrefix()]);
        const root = postcss.parse('.a{color:red}');

        await processor.process(root, { from: undefined });
        const result = await processor.process(root, { from: undefined });

        expect(result.css).toBe('.prefix .a{color:red}');
    });
});
