import { type ModuleLoadRecord } from '../contract';
import { createLoadDetails } from '../ui/load-details';

// eslint-disable-next-line no-script-url -- это и есть предмет теста
const SCRIPT_URL = 'javascript:alert(document.cookie)';

function createRecord(overrides: Partial<ModuleLoadRecord> = {}): ModuleLoadRecord {
    return {
        loadId: 'load-1',
        moduleId: 'module',
        hostAppId: 'host',
        status: 'loaded',
        shareScope: 'default',
        fromCache: false,
        scripts: [],
        styles: [],
        timings: {},
        startedAt: 0,
        ...overrides,
    };
}

describe('createLoadDetails', () => {
    it('should show the record meta', () => {
        const details = createLoadDetails(
            createRecord({ manifestUrl: 'https://cdn.test/manifest.json' }),
        );

        expect(details.textContent).toContain('host');
        expect(details.textContent).toContain('default');
        expect(details.textContent).toContain('https://cdn.test/manifest.json');
    });

    it('should link resources', () => {
        const details = createLoadDetails(
            createRecord({ scripts: ['https://cdn.test/module.js'] }),
        );
        const link = details.querySelector<HTMLAnchorElement>('a.resource__url');

        expect(link?.href).toBe('https://cdn.test/module.js');
        expect(link?.rel).toBe('noreferrer');
    });

    it('should not turn a javascript url into a link', () => {
        // манифест приезжает по сети, а `href` исполняет всё, что в него положили. Владелец
        // манифеста и так может подсунуть приложению любой <script src>, так что это гигиена,
        // а не дыра, - но панель не обязана добавлять ему ещё один способ
        const details = createLoadDetails(createRecord({ scripts: [SCRIPT_URL] }));

        expect(details.querySelector('a')).toBeNull();
        // url всё равно надо показать: именно он и есть подозрительный
        expect(details.textContent).toContain(SCRIPT_URL);
    });

    it('should not link a data url either', () => {
        const details = createLoadDetails(createRecord({ styles: ['data:text/css,body{}'] }));

        expect(details.querySelector('a')).toBeNull();
    });

    it('should link a relative resource url', () => {
        // модуль может лежать на том же origin, и тогда загрузчик кладёт в запись
        // относительный путь - открывать его в новой вкладке ничто не мешает
        const details = createLoadDetails(createRecord({ scripts: ['/static/module.js'] }));

        expect(details.querySelector<HTMLAnchorElement>('a.resource__url')?.href).toBe(
            'http://localhost/static/module.js',
        );
    });
});
