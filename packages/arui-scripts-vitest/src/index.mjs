// ESM-вход пакета. ESM-конфиг vitest (`.mjs`/`.mts` или проект с "type": "module") импортирует
// зависимости из node_modules нативно, а для CommonJS-модуля Node отдает в default весь module.exports,
// а не exports.default. Без этой обертки `import aruiConfig from '@alfalab/arui-scripts-vitest'`
// вернул бы `{ default, getVitestConfig }`, и vitest молча проигнорировал бы конфиг.
// eslint-disable-next-line import/no-useless-path-segments -- нативный ESM не импортирует директории, нужен путь до файла
import cjs from './index.js';

export const { getVitestConfig } = cjs;

export default cjs.default;
