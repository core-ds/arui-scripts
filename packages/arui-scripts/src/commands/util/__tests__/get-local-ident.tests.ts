import { getLocalIdent } from '../get-local-ident';

describe('CSS module identifiers', () => {
    const ident = (root: string, file: string, name = 'button') =>
        getLocalIdent({ rootContext: root, resourcePath: `${root}/${file}` }, '', name);

    test('is independent of the checkout directory', () => {
        expect(ident('/first/project', 'src/Button.module.css')).toBe(
            ident('/other/project', 'src/Button.module.css'),
        );
    });
    test.each(['css', 'scss', 'sass'])('uses parent directory for index.module.%s', (extension) => {
        expect(ident('/app', `src/Button/index.module.${extension}`)).toMatch(
            /^Button_button__[\w-]{5}$/,
        );
    });
    test('separates equal local names in different files and different names in one file', () => {
        const first = ident('/app', 'src/Button.module.css');

        expect(first).toMatch(/^Button_button__[\w-]{5}$/);
        expect(first).not.toBe(ident('/app', 'src/other/Button.module.css'));
        expect(first).not.toBe(ident('/app', 'src/Button.module.css', 'label'));
    });
    test('sanitizes dots in filenames', () => {
        expect(ident('/app', 'src/Button.mobile.module.css')).toMatch(
            /^Button_mobile_button__[\w-]{5}$/,
        );
    });
});
