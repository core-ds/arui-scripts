import fs from 'fs';
import path from 'path';

import shell from 'shelljs';

type Severity = 'error' | 'warning' | 'ok';

type CheckResult = {
    id: string;
    severity: Severity;
    message: string;
    recommendation?: string;
};

type CliArgs = {
    json: boolean;
};

const JS_TS_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];
const ARUI_CONFIG_FILES = [
    'arui-scripts.config.js',
    'arui-scripts.config.cjs',
    'arui-scripts.config.mjs',
    'arui-scripts.config.ts',
];

function parseArgs(args: string[]): CliArgs {
    return {
        json: args.includes('--json'),
    };
}

function hasAnyFile(paths: string[]) {
    return paths.some((targetPath) => fs.existsSync(targetPath));
}

function getNodeMajorVersion() {
    const [major] = process.versions.node.split('.');

    return Number(major);
}

function checkNodeVersion(): CheckResult {
    const major = getNodeMajorVersion();

    if (major >= 20) {
        return {
            id: 'node-version',
            severity: 'ok',
            message: `Node.js ${process.versions.node} поддерживается`,
        };
    }

    return {
        id: 'node-version',
        severity: 'error',
        message: `Node.js ${process.versions.node} не поддерживается`,
        recommendation: 'Переключитесь на Node.js 20+ (рекомендуется 22 LTS).',
    };
}

function checkYarnAvailability(cwd: string): CheckResult {
    const yarnLockPath = path.join(cwd, 'yarn.lock');

    if (!fs.existsSync(yarnLockPath)) {
        return {
            id: 'package-manager',
            severity: 'ok',
            message: 'yarn.lock не найден, проверка Yarn пропущена',
        };
    }

    if (!shell.which('yarn')) {
        return {
            id: 'package-manager',
            severity: 'error',
            message: 'В проекте есть yarn.lock, но Yarn не найден в PATH',
            recommendation: 'Установите Yarn 4+ и проверьте доступность команды yarn.',
        };
    }

    const yarnVersion = shell.exec('yarn -v', { silent: true }).toString().trim();

    return {
        id: 'package-manager',
        severity: 'ok',
        message: `Yarn найден (версия ${yarnVersion})`,
    };
}

function checkPackageJson(cwd: string): CheckResult {
    const packageJsonPath = path.join(cwd, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        return {
            id: 'package-json',
            severity: 'error',
            message: 'Не найден package.json в корне проекта',
            recommendation: 'Запустите команду в корне приложения с package.json.',
        };
    }

    return {
        id: 'package-json',
        severity: 'ok',
        message: 'package.json найден',
    };
}

function readProjectPackage(cwd: string): Record<string, unknown> | null {
    const packageJsonPath = path.join(cwd, 'package.json');

    if (!fs.existsSync(packageJsonPath)) {
        return null;
    }

    try {
        return JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    } catch (error) {
        return null;
    }
}

function checkEntrypoints(cwd: string, appPackage: Record<string, unknown> | null): CheckResult[] {
    const aruiConfig = (appPackage?.aruiScripts ?? {}) as Record<string, unknown>;
    const clientOnly = Boolean(aruiConfig.clientOnly);

    const clientEntrypoints = JS_TS_EXTENSIONS.map((ext) => path.join(cwd, `src/index.${ext}`));
    const serverEntrypoints = JS_TS_EXTENSIONS.map((ext) =>
        path.join(cwd, `src/server/index.${ext}`),
    );

    const checks: CheckResult[] = [];

    checks.push(
        hasAnyFile(clientEntrypoints)
            ? {
                  id: 'client-entrypoint',
                  severity: 'ok',
                  message: 'Клиентская точка входа найдена (src/index.*)',
              }
            : {
                  id: 'client-entrypoint',
                  severity: 'error',
                  message: 'Клиентская точка входа не найдена (src/index.*)',
                  recommendation: 'Создайте src/index.tsx (или js/jsx/ts).',
              },
    );

    if (!clientOnly) {
        checks.push(
            hasAnyFile(serverEntrypoints)
                ? {
                      id: 'server-entrypoint',
                      severity: 'ok',
                      message: 'Серверная точка входа найдена (src/server/index.*)',
                  }
                : {
                      id: 'server-entrypoint',
                      severity: 'warning',
                      message: 'Серверная точка входа не найдена (src/server/index.*)',
                      recommendation:
                          'Если проект client-only, укажите aruiScripts.clientOnly=true. Иначе добавьте src/server/index.ts.',
                  },
        );
    }

    return checks;
}

function checkConfig(cwd: string, appPackage: Record<string, unknown> | null): CheckResult[] {
    const results: CheckResult[] = [];
    const legacyConfigKey = appPackage?.['arui-scripts'];
    const modernConfigKey = appPackage?.aruiScripts;
    const configFile = ARUI_CONFIG_FILES.find((name) => fs.existsSync(path.join(cwd, name)));

    if (legacyConfigKey) {
        results.push({
            id: 'legacy-config-key',
            severity: 'error',
            message: 'Обнаружен устаревший ключ "arui-scripts" в package.json',
            recommendation: 'Переименуйте ключ в "aruiScripts".',
        });
    } else if (modernConfigKey || configFile) {
        results.push({
            id: 'config',
            severity: 'ok',
            message: `Конфигурация arui-scripts найдена${configFile ? ` (${configFile})` : ''}`,
        });
    } else {
        results.push({
            id: 'config',
            severity: 'warning',
            message: 'Конфигурация arui-scripts не найдена (используются дефолты)',
            recommendation:
                'При необходимости создайте arui-scripts.config.js или добавьте секцию aruiScripts в package.json.',
        });
    }

    return results;
}

function printHumanReadable(results: CheckResult[]) {
    const icons: Record<Severity, string> = {
        ok: '✓',
        warning: '!',
        error: 'x',
    };

    console.log('arui-scripts doctor report');
    console.log('');

    results.forEach((result) => {
        console.log(`[${icons[result.severity]}] ${result.message}`);

        if (result.recommendation) {
            console.log(`    → ${result.recommendation}`);
        }
    });
}

const args = parseArgs(process.argv.slice(3));
const cwd = process.cwd();

const packageCheck = checkPackageJson(cwd);
const appPackage = readProjectPackage(cwd);

const results = [
    checkNodeVersion(),
    checkYarnAvailability(cwd),
    packageCheck,
    ...checkEntrypoints(cwd, appPackage),
    ...checkConfig(cwd, appPackage),
];

const hasErrors = results.some((result) => result.severity === 'error');

if (args.json) {
    console.log(
        JSON.stringify(
            {
                ok: !hasErrors,
                results,
            },
            null,
            2,
        ),
    );
} else {
    printHumanReadable(results);
}

process.exit(hasErrors ? 1 : 0);
