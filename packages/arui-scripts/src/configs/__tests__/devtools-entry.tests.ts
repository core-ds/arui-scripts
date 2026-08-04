import { MODULES_SEPARATE_BUILD_NAME } from '../modules';
import { createSingleClientWebpackConfig } from '../rspack.client';
import { configs } from '../app-configs';

function isDevtoolsEntry(item: string) {
    return item.includes('scripts-devtools') && item.endsWith('auto.js');
}

function getEntries(entry: unknown): string[] {
    if (Array.isArray(entry)) {
        return entry as string[];
    }

    return Object.values(entry as Record<string, string[]>).flat();
}

function hasDevtools(entry: unknown) {
    return getEntries(entry).some(isDevtoolsEntry);
}

describe('devtools entry injection', () => {
    const initialMode = configs.devtools;
    const initialDisableModules = configs.disableModulesSupport;

    afterEach(() => {
        configs.devtools = initialMode;
        configs.disableModulesSupport = initialDisableModules;
    });

    it('should inject the panel into a dev build by default', () => {
        configs.devtools = 'dev';

        expect(hasDevtools(createSingleClientWebpackConfig('dev', './index.ts').entry)).toBe(true);
    });

    it('should not inject the panel into a production build by default', () => {
        configs.devtools = 'dev';

        expect(hasDevtools(createSingleClientWebpackConfig('prod', './index.ts').entry)).toBe(
            false,
        );
    });

    it('should inject the panel into a production build with always', () => {
        configs.devtools = 'always';

        expect(hasDevtools(createSingleClientWebpackConfig('prod', './index.ts').entry)).toBe(true);
    });

    it('should not inject the panel with off', () => {
        configs.devtools = 'off';

        expect(hasDevtools(createSingleClientWebpackConfig('dev', './index.ts').entry)).toBe(false);
    });

    it('should not inject the panel into the separate modules build', () => {
        configs.devtools = 'always';

        const config = createSingleClientWebpackConfig('dev', {}, MODULES_SEPARATE_BUILD_NAME);

        expect(hasDevtools(config.entry)).toBe(false);
    });

    it('should not inject the panel into a compat module config', () => {
        configs.devtools = 'always';

        const config = createSingleClientWebpackConfig(
            'dev',
            { someModule: './module.ts' },
            'someModule',
        );

        expect(hasDevtools(config.entry)).toBe(false);
    });

    it('should inject the panel into every entry point of the main config', () => {
        configs.devtools = 'dev';

        const config = createSingleClientWebpackConfig('dev', {
            first: './first.ts',
            second: './second.ts',
        });
        const entry = config.entry as Record<string, string[]>;

        expect(hasDevtools(entry.first)).toBe(true);
        expect(hasDevtools(entry.second)).toBe(true);
    });

    it('should put the panel before the application code', () => {
        configs.devtools = 'dev';

        const entry = getEntries(createSingleClientWebpackConfig('dev', './index.ts').entry);
        const devtoolsIndex = entry.findIndex(isDevtoolsEntry);

        // без этой проверки тест проходит и когда панели в сборке нет вовсе: -1 меньше любого индекса
        expect(devtoolsIndex).toBeGreaterThanOrEqual(0);
        // приложение может упасть на старте - панель к этому моменту должна быть уже установлена
        expect(devtoolsIndex).toBeLessThan(entry.indexOf('./index.ts'));
    });

    it('should not inject the panel when the project opted out of modules support', () => {
        configs.devtools = 'always';
        configs.disableModulesSupport = true;

        expect(hasDevtools(createSingleClientWebpackConfig('dev', './index.ts').entry)).toBe(false);
    });

    it('should inject the panel into a host that consumes modules without configuring them', () => {
        // хосту-потребителю ключ `modules` не нужен: он подключает модули в рантайме.
        // Панель нужна ему в первую очередь, поэтому пустой конфиг модулей её не отменяет
        configs.devtools = 'dev';
        configs.disableModulesSupport = false;

        expect(hasDevtools(createSingleClientWebpackConfig('dev', './index.ts').entry)).toBe(true);
    });

    it('should not inject the panel for an unknown devtools value', () => {
        // разрешающий список: незнакомый режим не должен уехать в прод-бандл,
        // даже если его забыли добавить в validateConfig
        configs.devtools = 'stand' as typeof configs.devtools;

        expect(hasDevtools(createSingleClientWebpackConfig('prod', './index.ts').entry)).toBe(
            false,
        );
        expect(hasDevtools(createSingleClientWebpackConfig('dev', './index.ts').entry)).toBe(false);
    });
});
