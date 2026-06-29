/* eslint-disable no-console */
import path from 'path';

import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';

import { buildContext } from './build-context';
import { buildFileMap } from './build-file-map';
import { detectPackageManager, installDeps, type PackageManager } from './install-deps';
import { getQuestions } from './questions';
import { type InitAnswers, type TemplateContext } from './types';
import { isDirEmpty, writeFiles } from './write-files';

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
const { version: aruiScriptsVersion } = require('../../../package.json');

export type RunInitOptions = {
    /** Аргумент `[dir]` из командной строки (необязательный). */
    targetDirArg?: string;
    /** Базовая директория (для тестов). По умолчанию — process.cwd(). */
    cwd?: string;
};

export async function runInit(options: RunInitOptions = {}): Promise<void> {
    const baseCwd = options.cwd ?? process.cwd();
    const targetDir = options.targetDirArg ? path.resolve(baseCwd, options.targetDirArg) : baseCwd;
    const defaultName = path.basename(targetDir);

    printBanner();

    if (!(await isDirEmpty(targetDir))) {
        const { proceed } = await prompts({
            type: 'confirm',
            name: 'proceed',
            message: chalk.yellow(`Папка ${targetDir} не пуста. Продолжить и добавить файлы?`),
            initial: false,
        });

        if (!proceed) {
            console.log(chalk.yellow('Отменено.'));

            return;
        }
    }

    let cancelled = false;

    const answers = await prompts(getQuestions(defaultName), {
        onCancel: () => {
            cancelled = true;

            return false;
        },
    });

    if (cancelled) {
        console.log(chalk.yellow('\nОтменено.'));

        return;
    }

    const initAnswers: InitAnswers = {
        name: String(answers.name).trim(),
        useRtk: Boolean(answers.useRtk),
        clientOnly: Boolean(answers.clientOnly),
        codeLoader: answers.codeLoader,
        testRunner: answers.testRunner,
        cssModules: Boolean(answers.cssModules),
        clientServerPort: Number(answers.clientServerPort) || 8080,
        serverPort: Number(answers.serverPort) || 3000,
        dockerRegistry: answers.dockerRegistry ?? '',
        presets: answers.presets ?? '',
        polyfills: Boolean(answers.polyfills),
        reactCompiler: Boolean(answers.reactCompiler),
        install: Boolean(answers.install),
    };

    const context = buildContext(initAnswers, aruiScriptsVersion);
    const files = buildFileMap(context);

    await writeFiles(targetDir, files);

    printSuccess(context, targetDir, Object.keys(files).length);

    const packageManager = detectPackageManager();

    if (initAnswers.install) {
        const spinner = ora({ text: 'Устанавливаю зависимости…', color: 'cyan' }).start();

        try {
            await installDeps(targetDir, packageManager);
            spinner.succeed(chalk.green('Зависимости установлены'));
        } catch (error) {
            spinner.fail(chalk.red('Не удалось установить зависимости'));
            throw error;
        }
    }

    printNextSteps(targetDir, baseCwd, initAnswers, packageManager);
}

function printBanner(): void {
    console.log();
    console.log(
        `  ${chalk.bgCyan.black.bold(' arui-scripts ')} ${chalk.dim(
            `init · v${aruiScriptsVersion}`,
        )}`,
    );
    console.log(`  ${chalk.dim('Создаем новый проект - ответьте на несколько вопросов.')}`);
    console.log();
}

function printSuccess(context: TemplateContext, targetDir: string, fileCount: number): void {
    const stack = [
        chalk.cyan(context.useRtk ? 'React + RTK' : 'React'),
        chalk.dim(context.clientOnly ? 'clientOnly' : 'SSR'),
        chalk.dim(context.codeLoader),
        chalk.dim(context.testRunner),
    ].join(chalk.dim(' · '));

    console.log();
    console.log(
        `  ${chalk.green('✔')} ${chalk.bold('Готово!')} ${chalk.dim(
            `проект «${context.name}» создан`,
        )}`,
    );
    console.log(`    ${chalk.dim(targetDir)}`);
    console.log(`    ${chalk.dim(`${fileCount} файлов`)} ${chalk.dim('·')} ${stack}`);
}

function printNextSteps(
    targetDir: string,
    baseCwd: string,
    answers: InitAnswers,
    packageManager: PackageManager,
): void {
    const relativeDir = path.relative(baseCwd, targetDir);
    const installCommand = packageManager === 'yarn' ? 'yarn' : 'npm install';
    const startCommand = packageManager === 'yarn' ? 'yarn start' : 'npm start';

    const steps: string[] = [];

    if (relativeDir) {
        steps.push(`cd ${relativeDir}`);
    }
    if (!answers.install) {
        steps.push(installCommand);
    }
    steps.push(startCommand);

    console.log();
    console.log(`  ${chalk.bold('Дальше')}`);
    steps.forEach((step, index) => {
        console.log(`    ${chalk.dim(`${index + 1}.`)} ${chalk.cyan(step)}`);
    });
    console.log();
}
