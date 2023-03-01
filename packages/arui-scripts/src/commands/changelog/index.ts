/**
 * Формирует описание версии в `CHANGELOG.md` на основе данных введенных в Jenkins при старте пайплайна.
 * `standard-version` запускает этот скрипт как `postchangelog` хук.
 */

import {execSync} from 'child_process';
import {createReadStream, createWriteStream, promises} from 'fs';
import readline from 'readline';
import {getDefaults} from "../../configs/app-configs/get-defaults";

const {readFile, rename, unlink} = promises;

type GetVersionDescriptionParams = {
    features: string;
    bugFixes: string;
    breakingChanges: string;
};

type Status = 'PENDING' | 'MODIFYING' | 'MODIFIED';

/**
 * Сюда пайплайн Jenkins складывает соответствующие части описания версии. Не получается использовать
 * переменные окружения, т.к. `standard-version` запускает хуки через `child_process.exec`, не передавая туда
 * ни аргументы ни переменные окружения.
 */
const {
    appNodeModulesBin,
    changelogPath,
    changelogTmpPath,
    changelogFeaturesPath,
    changelogBugfixesPath,
    changelogBreakingChangesPath
} = getDefaults();

// Пример заголовка – `## [50.1.0](http://git.moscow.alfaintra.net/...) (2022-07-27)`.
const changelogHeaderRegExp = /^###? \[\d+\.\d+\.\d+]\([^)]+\) \(\d{4}-\d{2}-\d{2}\)/;

(async () => {
    const rl = readline.createInterface({
        input: createReadStream(changelogPath),
    });
    const ws = createWriteStream(changelogTmpPath);

    let modifyingStatus: Status = 'PENDING';

    const addVersionDescription = async () => {
        const [features, bugFixes, breakingChanges] = await Promise.all([
            readFile(changelogFeaturesPath, 'utf-8'),
            readFile(changelogBugfixesPath, 'utf-8'),
            readFile(changelogBreakingChangesPath, 'utf-8'),
        ]).then((files) => files.map((content) => content.trim()));

        ws.write(getVersionDescription({features, bugFixes, breakingChanges}));
    }

    for await (const line of rl) {
        switch (modifyingStatus) {
            // Копируем всё как есть до первого заголовка.
            case 'PENDING':
                if (changelogHeaderRegExp.test(line)) {
                    modifyingStatus = 'MODIFYING';
                }
                ws.write(`${line}\n`);
                break;

            // Игнорируем описание версии, сгенерированное пакетом `standard-version`, пишем своё
            // до второго заголовка. См. описание задачи http://jira.moscow.alfaintra.net/browse/NEWCLICKUI-1048
            case 'MODIFYING':
                if (changelogHeaderRegExp.test(line)) {
                    modifyingStatus = 'MODIFIED';

                    await addVersionDescription();
                    ws.write(`${line}\n`);
                }
                break;

            // Дальше просто копируем всё как есть.
            case 'MODIFIED':
                ws.write(`${line}\n`);
                break;
        }
    }

    if (modifyingStatus !== 'MODIFIED') {
        await addVersionDescription();
    }

    ws.close();

    await unlink(changelogPath);
    await rename(changelogTmpPath, changelogPath);
    execSync(`${appNodeModulesBin}/prettier -w "${changelogPath}"`);

    process.exit(0);
})();

function getVersionDescription({features, bugFixes, breakingChanges}: GetVersionDescriptionParams) {
    let versionDescription = '';

    if (features) {
        versionDescription += `### Features\n${features}\n`;
    }

    if (bugFixes) {
        versionDescription += `### Bug Fixes\n${bugFixes}\n`;
    }

    if (breakingChanges) {
        versionDescription += `### ⚠ BREAKING CHANGES\n${breakingChanges}\n`;
    }

    return versionDescription;
}
