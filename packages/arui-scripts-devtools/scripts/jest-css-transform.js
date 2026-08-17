/* eslint-disable */
/**
 * Отдаёт css-файл строкой - ровно так же, как правило asset/source в пре-бандле.
 * Нужен настоящий текст, а не заглушка: инвариант-тест стилей проверяет содержимое.
 */
module.exports = {
    process(sourceText) {
        return { code: `module.exports = ${JSON.stringify(sourceText)};` };
    },
};
