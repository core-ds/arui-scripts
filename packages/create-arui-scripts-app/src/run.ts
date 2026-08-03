/* eslint-disable no-console */
import path from 'path';

import chalk from 'chalk';
import ora from 'ora';
import prompts from 'prompts';

import { buildContext } from './build-context';
import { buildFileMap } from './build-file-map';
import { answersFromFlags, type CliFlags, hasAnswerFlags } from './defaults';
import {
    detectPackageManager,
    installDependencies,
    type PackageManager,
} from './install-dependencies';
import { getQuestions } from './questions';
import { type InitAnswers, type TemplateContext } from './types';
import { validateProjectName } from './validate-project-name';
import { DEFAULT_ARUI_SCRIPTS_VERSION } from './versions';
import {
    copyStaticAssets,
    findConflictingFiles,
    STATIC_ASSET_PATHS,
    writeFiles,
} from './write-files';

// eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
const { version: cliVersion } = require('../package.json');

export type RunInitOptions = {
    // аргумент `[dir]` из командной строки
    targetDirArg?: string;
    // базовая директория (для тестов). По умолчанию — process.cwd()
    cwd?: string;
    // версия arui-scripts для package.json
    aruiScriptsVersion?: string;
    // Флаги CLI
    flags?: CliFlags;
};

export async function runInit(options: RunInitOptions = {}): Promise<void> {
    const baseCwd = options.cwd ?? process.cwd();
    const targetDir = options.targetDirArg ? path.resolve(baseCwd, options.targetDirArg) : baseCwd;
    const defaultName = path.basename(targetDir);
    const aruiScriptsVersion = options.aruiScriptsVersion ?? DEFAULT_ARUI_SCRIPTS_VERSION;
    const flags = options.flags ?? {};

    printBanner();

    const initAnswers = await resolveAnswers(defaultName, flags);

    const nameError = validateProjectName(initAnswers.name);

    if (nameError !== true) {
        throw new Error(nameError);
    }

    const context = buildContext(initAnswers, aruiScriptsVersion);
    const files = buildFileMap(context);
    const conflicts = await findConflictingFiles(targetDir, files, STATIC_ASSET_PATHS);

    if (conflicts.length > 0 && !flags.force) {
        throw new Error(
            [
                `В ${targetDir} уже есть файлы, которые мастер хочет создать:`,
                ...conflicts.map((file) => `  - ${file}`),
                'Передайте --force, чтобы перезаписать, или выберите пустую папку.',
            ].join('\n'),
        );
    }

    await writeFiles(targetDir, files);
    const assetsCount = await copyStaticAssets(targetDir);

    printSuccess(context, targetDir, Object.keys(files).length + assetsCount);

    const packageManager = detectPackageManager();

    if (initAnswers.install) {
        const spinner = ora({ text: 'Устанавливаю зависимости…', color: 'cyan' }).start();

        try {
            await installDependencies(targetDir, packageManager);
            spinner.succeed(chalk.green('Зависимости установлены'));
        } catch (error) {
            spinner.fail(chalk.red('Не удалось установить зависимости'));
            throw error;
        }
    }

    printNextSteps(targetDir, baseCwd, initAnswers, packageManager);
}

async function resolveAnswers(defaultName: string, flags: CliFlags): Promise<InitAnswers> {
    const base = answersFromFlags(defaultName, flags);

    if (flags.yes) {
        return base;
    }

    if (!process.stdin.isTTY) {
        if (hasAnswerFlags(flags)) {
            return base;
        }

        throw new Error(
            'Интерактивный режим недоступен. Передайте --yes или явные флаги настроек.',
        );
    }

    let cancelled = false;

    // Вопросы, отвеченные флагами, пропускаются — мастер задаст только остальные.
    const answers = await prompts(getQuestions(defaultName, flags), {
        onCancel: () => {
            cancelled = true;

            return false;
        },
    });

    if (cancelled) {
        throw new Error('Отменено.');
    }

    return mergePromptAnswers(base, answers);
}

// Накладывает ответы мастера поверх базовых значений (флаги + дефолты)
function mergePromptAnswers(base: InitAnswers, answers: prompts.Answers<string>): InitAnswers {
    const merged = { ...base };

    if (answers.name !== undefined) {
        merged.name = String(answers.name).trim();
    }

    if (answers.useRtk !== undefined) {
        merged.useRtk = Boolean(answers.useRtk);
    }

    if (answers.clientOnly !== undefined) {
        merged.clientOnly = Boolean(answers.clientOnly);
    }

    if (answers.codeLoader !== undefined) {
        merged.codeLoader = answers.codeLoader;
    }

    if (answers.testRunner !== undefined) {
        merged.testRunner = answers.testRunner;
    }

    if (answers.cssModules !== undefined) {
        merged.cssModules = Boolean(answers.cssModules);
    }

    if (answers.clientServerPort !== undefined) {
        merged.clientServerPort = Number(answers.clientServerPort) || 8080;
    }

    if (answers.serverPort !== undefined) {
        merged.serverPort = Number(answers.serverPort) || 3000;
    }

    if (answers.dockerRegistry !== undefined) {
        merged.dockerRegistry = String(answers.dockerRegistry);
    }
    if (answers.presets !== undefined) {
        merged.presets = String(answers.presets);
    }

    if (answers.polyfills !== undefined) {
        merged.polyfills = Boolean(answers.polyfills);
    }

    if (answers.reactCompiler !== undefined) {
        merged.reactCompiler = Boolean(answers.reactCompiler);
    }

    if (answers.install !== undefined) {
        merged.install = Boolean(answers.install);
    }

    return merged;
}

function printBanner(): void {
    console.log();
    console.log(
        `  ${chalk.bgCyan.black.bold(' create-arui-scripts-app ')} ${chalk.dim(`v${cliVersion}`)}`,
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

// Путь для подсказки `cd`: null — цель совпадает с cwd, а относительный — если цель внутри cwd, иначе берем абсолютный
export function resolveCdPath(baseCwd: string, targetDir: string): string | null {
    const relativeDir = path.relative(baseCwd, targetDir);

    if (!relativeDir) {
        return null;
    }

    if (relativeDir.startsWith('..') || path.isAbsolute(relativeDir)) {
        return targetDir;
    }

    return relativeDir;
}

function printNextSteps(
    targetDir: string,
    baseCwd: string,
    answers: InitAnswers,
    packageManager: PackageManager,
): void {
    const cdPath = resolveCdPath(baseCwd, targetDir);
    const installCommand = packageManager === 'yarn' ? 'yarn' : 'npm install';
    const startCommand = packageManager === 'yarn' ? 'yarn start' : 'npm start';
    const steps: string[] = [];

    if (cdPath) {
        steps.push(`cd ${cdPath}`);
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
