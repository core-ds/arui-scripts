import { render } from '@testing-library/react';

import { type ModuleLoadRecord } from '../contract';
import { LoadDetails } from '../panel/load-details';

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

describe('LoadDetails', () => {
    it('should show the record meta', () => {
        const { container } = render(
            <LoadDetails
                record={createRecord({ manifestUrl: 'https://cdn.test/manifest.json' })}
            />,
        );

        expect(container.textContent).toContain('host');
        expect(container.textContent).toContain('default');
        expect(container.textContent).toContain('https://cdn.test/manifest.json');
    });

    it('should link resources', () => {
        const { container } = render(
            <LoadDetails record={createRecord({ scripts: ['https://cdn.test/module.js'] })} />,
        );
        const link = container.querySelector<HTMLAnchorElement>('a.resource__url');

        expect(link?.href).toBe('https://cdn.test/module.js');
        expect(link?.rel).toBe('noreferrer');
    });

    it('should not turn a javascript url into a link', () => {
        // манифест приезжает по сети, а `href` исполняет всё, что в него положили. Владелец
        // манифеста и так может подсунуть приложению любой <script src>, так что это гигиена,
        // а не дыра, - но панель не обязана добавлять ему ещё один способ
        const { container } = render(
            <LoadDetails record={createRecord({ scripts: [SCRIPT_URL] })} />,
        );

        expect(container.querySelector('a')).toBeNull();
        // url всё равно надо показать: именно он и есть подозрительный
        expect(container.textContent).toContain(SCRIPT_URL);
    });

    it('should not link a data url either', () => {
        const { container } = render(
            <LoadDetails record={createRecord({ styles: ['data:text/css,body{}'] })} />,
        );

        expect(container.querySelector('a')).toBeNull();
    });

    it('should link a relative resource url', () => {
        // модуль может лежать на том же origin, и тогда загрузчик кладёт в запись
        // относительный путь - открывать его в новой вкладке ничто не мешает
        const { container } = render(
            <LoadDetails record={createRecord({ scripts: ['/static/module.js'] })} />,
        );

        expect(container.querySelector<HTMLAnchorElement>('a.resource__url')?.href).toBe(
            'http://localhost/static/module.js',
        );
    });
});
