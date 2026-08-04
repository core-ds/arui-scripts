import { BADGE_STYLES } from '../ui/badge';
import { PANEL_STYLES } from '../ui/styles';

/** объявления токенов живут в одном блоке в начале листа, всё остальное - правила */
function getRules(css: string) {
    return css.replace(/:host\s*\{[^}]*\}/, '');
}

/** цвет, вписанный руками мимо токенов */
const LITERAL_COLOR = /#[0-9a-f]{3,8}\b|\brgba?\(/i;

describe.each([
    ['PANEL_STYLES', PANEL_STYLES],
    ['BADGE_STYLES', BADGE_STYLES],
])('%s', (_name, css) => {
    it('should take every colour from a token, not from a literal', () => {
        // цвет мимо токена не поменяется вместе с палитрой приложения и разъедется
        // с остальным интерфейсом - такие правки надо ловить сразу
        expect(getRules(css)).not.toMatch(LITERAL_COLOR);
    });

    it('should declare its tokens in a single block at the top', () => {
        const [declarations] = css.match(/:host\s*\{[^}]*\}/) ?? [];

        expect(declarations).toContain('--arui-devtools-');
        expect(css.indexOf(':host')).toBeLessThan(css.indexOf('--arui-devtools-'));
    });

    it('should name core-components variables and keep their values as a fallback', () => {
        // пакет с нулём зависимостей не может импортировать @alfalab/core-components/vars,
        // поэтому имена переменных дизайн-системы идут с запасными значениями: есть вары
        // у приложения - панель возьмёт его палитру, нет - свою копию
        const tokens = (css.match(/--arui-devtools-[\w-]+:[^;]+/g) ?? []).map((declaration) =>
            declaration.slice(declaration.indexOf(':') + 1).trim(),
        );

        expect(tokens.length).toBeGreaterThan(0);

        tokens
            .filter((value) => value.indexOf('var(') === 0)
            .forEach((value) => {
                // длинные значения prettier переносит, поэтому пробелы после `var(` допустимы
                expect(value).toMatch(/^var\(\s*--[\w-]+,[\s\S]+\)$/);
            });
    });
});

describe('PANEL_STYLES', () => {
    it('should use the core-components dark palette', () => {
        expect(PANEL_STYLES).toContain('var(--color-dark-bg-primary, #0b1f35)');
        expect(PANEL_STYLES).toContain('var(--color-dark-text-primary, #fff)');
    });

    it('should keep a monospaced font for data', () => {
        // url, версии, стеки и тайминги читают глазами по столбцам - пропорциональный
        // шрифт дизайн-системы тут мешает, а не помогает
        expect(PANEL_STYLES).toContain('--arui-devtools-font-mono');
    });
});
