// Разделители строк U+2028/U+2029 — валидны в JSON, но ломают JS-парсер, если
// вставлять строку внутрь `<script>`. Задаём их через коды символов, чтобы не хранить
// невидимые символы в исходнике.
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

const HTML_ESCAPE_LOOKUP: Record<string, string> = {
    '<': '\\u003c',
    '>': '\\u003e',
    '&': '\\u0026',
    [LINE_SEPARATOR]: '\\u2028',
    [PARAGRAPH_SEPARATOR]: '\\u2029',
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
    return JSON.stringify(value).replace(HTML_ESCAPE_REGEXP, (char) => HTML_ESCAPE_LOOKUP[char]);
}
