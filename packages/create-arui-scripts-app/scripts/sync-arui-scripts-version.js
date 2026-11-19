#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const aruiScriptsPkg = require('../../arui-scripts/package.json');

const outFile = path.join(__dirname, '../src/versions.ts');

const content = `/** Версия arui-scripts, которую scaffold кладёт в package.json нового проекта.
 * Генерируется скриптом scripts/sync-arui-scripts-version.js при сборке.
 */
export const DEFAULT_ARUI_SCRIPTS_VERSION = '${aruiScriptsPkg.version}';
`;

fs.writeFileSync(outFile, content);
console.log(`synced DEFAULT_ARUI_SCRIPTS_VERSION=${aruiScriptsPkg.version}`);
