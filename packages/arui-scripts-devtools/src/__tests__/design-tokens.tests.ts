import fs from 'fs';
import path from 'path';

import PANEL_STYLES from '../panel/styles.css';

/**
 * Панель не импортирует `@alfalab/core-components/vars`: расширение обязано быть
 * самодостаточным - у документа DevTools нет ни приложения, ни его палитры. Поэтому переменные
 * дизайн-системы названы по именам и продублированы запасными значениями, а размеры написаны
 * числами.
 *
 * И копия значений, и числа живут ровно до первой невнимательной правки, поэтому сверяем их
 * с настоящей дизайн-системой: пакет стоит в devDependencies как раз ради этого теста.
 */
const CORE = path.dirname(
    path.dirname(require.resolve('@alfalab/core-components/vars/colors-indigo.css')),
);

/** файлы, в которых объявлены токены, к которым обращается панель */
const TOKEN_FILES = [
    'vars/colors-indigo.css',
    'vars/colors.css',
    'vars/colors-addons.css',
    'vars/shadows-indigo.css',
    'vars/typography.css',
    'vars/border-radius.css',
    'vars/gaps.css',
];

/** компоненты, чью геометрию панель повторяет: их размеры тоже часть дизайн-системы */
const COMPONENT_FILES = ['button/desktop.css', 'tag/desktop.css', 'status/index.css'];

const normalize = (value: string) => value.replace(/\s+/g, ' ').replace(/,\s*/g, ', ').trim();

function read(file: string): string {
    return fs.readFileSync(path.join(CORE, file), 'utf8');
}

/** все объявления `--name: value` дизайн-системы; первое объявление считаем основным */
function readDesignTokens(): Map<string, string> {
    const tokens = new Map<string, string>();

    TOKEN_FILES.forEach((file) => {
        Array.from(read(file).matchAll(/(--[a-z0-9-]+):\s*([^;]+);/gi)).forEach(
            ([, name, value]) => {
                if (!tokens.has(name)) {
                    tokens.set(name, normalize(value));
                }
            },
        );
    });

    return tokens;
}

/** обращения панели к дизайн-системе: имя токена и запасное значение рядом с ним */
function readPanelFallbacks(): Array<{ name: string; fallback: string }> {
    const used: Array<{ name: string; fallback: string }> = [];

    Array.from(PANEL_STYLES.matchAll(/var\((--[a-z0-9-]+),/gi)).forEach((match) => {
        const start = (match.index ?? 0) + match[0].length;
        let depth = 1;
        let end = start;

        // запасное значение может само содержать скобки: у теней и шрифтов их сколько угодно
        while (end < PANEL_STYLES.length && depth > 0) {
            if (PANEL_STYLES[end] === '(') {
                depth += 1;
            }

            if (PANEL_STYLES[end] === ')') {
                depth -= 1;
            }

            end += 1;
        }

        used.push({ name: match[1], fallback: normalize(PANEL_STYLES.slice(start, end - 1)) });
    });

    return used;
}

/** значения шкалы: числа из токенов, чьё имя подходит под образец */
function readScale(files: string[], name: RegExp): Set<number> {
    const values = new Set<number>();

    files.forEach((file) => {
        Array.from(read(file).matchAll(/(--[a-z0-9-]+):\s*(-?\d+)px[;\s]/gi)).forEach(
            ([, token, value]) => {
                if (name.test(token)) {
                    values.add(Math.abs(Number(value)));
                }
            },
        );
    });

    return values;
}

/** значения из миксинов типографики: у них нет имён, только сами правила */
function readTypography(property: string): Set<number> {
    const css = read('vars/typography.css');
    const found = css.matchAll(new RegExp(`${property}:\\s*(\\d+)px`, 'g'));

    return new Set(Array.from(found).map(([, value]) => Number(value)));
}

/**
 * Размеры мимо шкалы - у каждого своя причина, и она записана в styles.css рядом:
 * padding кнопки дизайн-системы, две колоночные выкладки и приём «скрыть, но озвучить».
 */
const SCALE_EXCEPTIONS = ['0 15px', '12px 16px 16px 44px', '176px', '-1px'];

describe('цвета и тени панели', () => {
    const design = readDesignTokens();
    const used = readPanelFallbacks();

    it('should read the design system', () => {
        expect(design.size).toBeGreaterThan(100);
        expect(used.length).toBeGreaterThan(10);
    });

    it('should name only variables the design system really has', () => {
        // опечатка в имени не видна глазом: переменной нет - молча берётся запасное значение,
        // и палитра приложения перестаёт на панель влиять
        const unknown = used.filter(({ name }) => !design.has(name)).map(({ name }) => name);

        expect(Array.from(new Set(unknown))).toEqual([]);
    });

    it('should keep every fallback equal to the design system value', () => {
        const drifted = used
            .filter(({ name, fallback }) => design.has(name) && design.get(name) !== fallback)
            .map(
                ({ name, fallback }) =>
                    `${name}: у нас ${fallback}, в core-components ${design.get(name)}`,
            );

        expect(drifted).toEqual([]);
    });
});

describe('шкала размеров панели', () => {
    const gaps = readScale(['vars/gaps.css'], /^--gap-/);
    const radii = readScale(
        ['vars/border-radius.css', ...COMPONENT_FILES],
        /border-radius$|^--border-radius-/,
    );
    const scales: Record<string, Set<number>> = {
        'border-radius': radii,
        'font-size': readTypography('font-size'),
        'line-height': readTypography('line-height'),
    };

    it('should read the design system scale', () => {
        expect(gaps.size).toBeGreaterThan(5);
        expect(radii.size).toBeGreaterThan(5);
        expect(scales['font-size'].size).toBeGreaterThan(5);
    });

    it('should keep every size on the design system scale', () => {
        const offScale: string[] = [];

        Array.from(
            PANEL_STYLES.matchAll(
                /^\s*(padding|margin|gap|border-radius|font-size|line-height)(-[a-z]+)?:\s*([^;]+);/gm,
            ),
        ).forEach(([, property, side, rawValue]) => {
            const value = rawValue.trim();

            if (/var\(|%|auto|calc/.test(value) || SCALE_EXCEPTIONS.includes(value)) {
                return;
            }

            const scale = scales[property] ?? gaps;
            const sizes = Array.from(value.matchAll(/(-?\d+)px/g)).map(([, size]) =>
                Math.abs(Number(size)),
            );

            if (sizes.some((size) => size !== 0 && !scale.has(size))) {
                offScale.push(`${property}${side ?? ''}: ${value}`);
            }
        });

        expect(offScale).toEqual([]);
    });
});
