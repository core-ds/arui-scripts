/** правила, внутри которых лежат такие же правила с селекторами, а не объявления */
const NESTED_AT_RULES = ['@media', '@supports', '@layer', '@container', '@scope'];

function isNestedAtRule(prelude: string): boolean {
    return NESTED_AT_RULES.some((name) => prelude.indexOf(name) === 0);
}

/** индекс `}`, закрывающей блок, открытый в `open`, или -1 если блок не закрыт */
function findBlockEnd(css: string, open: number): number {
    let depth = 0;

    for (let index = open; index < css.length; index++) {
        if (css.charAt(index) === '{') {
            depth += 1;
        } else if (css.charAt(index) === '}') {
            depth -= 1;

            if (depth === 0) {
                return index;
            }
        }
    }

    return -1;
}

function scopeSelector(selector: string, scope: string): string {
    return selector
        .split(',')
        .map((part) => {
            const trimmed = part.trim();

            // :host - это сам хост-элемент, а не что-то внутри него
            if (trimmed === ':host') {
                return scope;
            }

            if (trimmed.indexOf(':host ') === 0) {
                return `${scope} ${trimmed.slice(':host '.length).trim()}`;
            }

            return `${scope} ${trimmed}`;
        })
        .join(', ');
}

/**
 * Переписывает стилевой лист так, чтобы он действовал только внутри одного элемента.
 *
 * Нужно там, где `attachShadow` недоступен: без shadow root `<style>` панели становится
 * документным, `:host` не матчится ни на что, а универсальные имена - `.panel`, `.header`,
 * `.button`, `.row` - начинают перекрашивать само приложение. Панель обещает обратное:
 * своих стилей наружу не отдаёт.
 *
 * Разбор нарочно примитивный - это наши же стили, а не произвольный css. Всё, до чего разборщик
 * не добрался (незакрытый блок и остаток после него), в результат не попадает: непереписанное
 * правило утекло бы в приложение, а недокрашенная панель - это всего лишь недокрашенная панель.
 */
export function scopeStyles(source: string, scope: string): string {
    // Комментарии выкидываем сразу: они приезжают в тот же кусок текста, что и селектор
    // следующего правила, а запятая внутри комментария развалила бы его на несколько нерабочих
    const css = source.replace(/\/\*[\s\S]*?\*\//g, '');

    let result = '';
    let index = 0;

    while (index < css.length) {
        const open = css.indexOf('{', index);

        if (open === -1) {
            break;
        }

        const end = findBlockEnd(css, open);

        if (end === -1) {
            break;
        }

        const prelude = css.slice(index, open).trim();
        const body = css.slice(open + 1, end);

        if (prelude.charAt(0) === '@') {
            result += `${prelude} {${isNestedAtRule(prelude) ? scopeStyles(body, scope) : body}}\n`;
        } else {
            result += `${scopeSelector(prelude, scope)} {${body}}\n`;
        }

        index = end + 1;
    }

    return result;
}
