/**
 * Формирует описание версии в `CHANGELOG.md` на основе данных введенных в Jenkins при старте пайплайна.
 * `standard-version` запускает этот скрипт как `postchangelog` хук.
 */

/* eslint-disable @typescript-eslint/no-var-requires */
const { execSync } = require('child_process');
const {
    createReadStream,
    createWriteStream,
    promises: { readFile, rename, unlink },
} = require('fs');
const { resolve } = require('path');
const readline = require('readline');

const nodeModulesBinPath = resolve(__dirname, './node_modules/.bin');

const changelogPath = resolve(__dirname, './CHANGELOG.md');
const changelogTmpPath = resolve(__dirname, './CHANGELOG_TMP.md');

/**
 * Сюда пайплайн Jenkins складывает соответствующие части описания версии. Не получается использовать
 * переменные окружения, т.к. `standard-version` запускает хуки через `child_process.exec`, не передавая туда
 * ни аргументы ни переменные окружения.
 */
const changelogFeaturesPath = resolve(__dirname, './changelog_features.tmp');
const changelogBugfixesPath = resolve(__dirname, './changelog_bugfixes.tmp');
const changelogBreakingChangesPath = resolve(__dirname, './changelog_breaking_changes.tmp');

// Пример заголовка – `## [50.1.0](http://git.moscow.alfaintra.net/...) (2022-07-27)`.
const changelogHeaderRegExp = /^###? \[\d+\.\d+\.\d+]\([^)]+\) \(\d{4}-\d{2}-\d{2}\)/;

(async () => {
    const rl = readline.createInterface({
        input: createReadStream(changelogPath),
    });
    const ws = createWriteStream(changelogTmpPath);

    let modifyingStatus = 'PENDING'; // 'PENDING' | 'MODIFYING' | 'MODIFIED'

    // eslint-disable-next-line no-restricted-syntax
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

                    const [features, bugFixes, breakingChanges] = await Promise.all([
                        readFile(changelogFeaturesPath, 'utf-8'),
                        readFile(changelogBugfixesPath, 'utf-8'),
                        readFile(changelogBreakingChangesPath, 'utf-8'),
                    ]).then((files) => files.map((content) => content.trim()));

                    ws.write(getVersionDescription({ features, bugFixes, breakingChanges }));
                    ws.write(`${line}\n`);
                }
                break;

            // Дальше просто копируем всё как есть.
            case 'MODIFIED':
                ws.write(`${line}\n`);
                break;
        }
    }

    ws.close();

    execSync(`${nodeModulesBinPath}/prettier -w "${changelogTmpPath}"`);
    await unlink(changelogPath);
    await rename(changelogTmpPath, changelogPath);
    process.exit(0);
})();

type getVersionDescriptionParams = {
    features: string;
    bugFixes: string;
    breakingChanges: string;
}

function getVersionDescription({ features, bugFixes, breakingChanges }: getVersionDescriptionParams) {
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
