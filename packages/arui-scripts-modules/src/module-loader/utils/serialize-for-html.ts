// Разделители строк U+2028/U+2029 — валидны в JSON, но ломают JS-парсер, если
// вставлять строку внутрь `<script>`. Задаём их через коды символов, чтобы не хранить
// невидимые символы в исходнике.
const LINE_SEPARATOR = String.fromCharCode(0x20_28);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x20_29);

const HTML_ESCAPE_LOOKUP: Record<string, string> = {
    '<': String.raw`\u003c`,
    '>': String.raw`\u003e`,
    '&': String.raw`\u0026`,
    [LINE_SEPARATOR]: String.raw`\u2028`,
    [PARAGRAPH_SEPARATOR]: String.raw`\u2029`,
};

const HTML_ESCAPE_REGEXP = new RegExp(`[<>&${LINE_SEPARATOR}${PARAGRAPH_SEPARATOR}]`, 'g');

/**
 * Сериализует значение в JSON, безопасный для вставки внутрь `<script>` в HTML.
 *
 * Экранирует `<`, `>`, `&` и разделители строк U+2028/U+2029, чтобы:
 * - предотвратить "выход" из тега через `</script>`;
 * - избежать поломки JSON парсерами, которые считают U+2028/U+2029 переносами строк.
 *
 * Результат остаётся валидным JSON (экранирование через `\uXXXX`), поэтому его можно
 * прочитать через `JSON.parse`.
 */
export function serializeForHtml(value: unknown): string {
    return JSON.stringify(value).replaceAll(HTML_ESCAPE_REGEXP, (char) => HTML_ESCAPE_LOOKUP[char]);
}
