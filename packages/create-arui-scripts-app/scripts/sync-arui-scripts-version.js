#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-var-requires, global-require, no-console */
const fs = require('fs');
const path = require('path');

const aruiScriptsPkg = require(path.join(__dirname, '../../arui-scripts/package.json'));
const outFile = path.join(__dirname, '../src/versions.ts');

const content = `/** Версия arui-scripts, которую scaffold кладёт в package.json нового проекта.
 * Генерируется скриптом scripts/sync-arui-scripts-version.js при сборке.
 */
export const DEFAULT_ARUI_SCRIPTS_VERSION = '${aruiScriptsPkg.version}';
`;

fs.writeFileSync(outFile, content);
console.log(`synced DEFAULT_ARUI_SCRIPTS_VERSION=${aruiScriptsPkg.version}`);
