import { scriptsFetcher, stylesFetcher } from '../dom-utils';
import { fetchResources } from '../fetch-resources';
import { MODULE_SSR_HREF_ATTRIBUTE } from '../get-embedded-module-resources';
import { isSafari } from '../is-safari';

jest.mock('../dom-utils', () => ({
    scriptsFetcher: jest.fn(() => Promise.resolve([])),
    stylesFetcher: jest.fn(() => Promise.resolve([])),
}));

jest.mock('../is-safari', () => ({
    isSafari: jest.fn(() => false),
}));

const DATA_APP_ID_ATTRIBUTE = 'data-parent-app-id';
const MODULE_ID = 'module-id';

describe('fetchResources', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        document.head.innerHTML = '';
    });

    it('should resolve relative resources against baseUrl and keep absolute resources unchanged', async () => {
        await fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: [
                'static/js/main.js',
                'https://cdn.example.com/module.js',
                '//cdn.example.com/protocol-relative.js',
                'data:text/javascript,console.log(1)',
            ],
            styles: [
                'static/css/main.css',
                'https://cdn.example.com/module.css',
                '//cdn.example.com/protocol-relative.css',
                'blob:https://example.com/style',
            ],
            baseUrl: 'https://module.example.com/app/',
        });

        expect(scriptsFetcher).toHaveBeenCalledWith(
            expect.objectContaining({
                urls: [
                    'https://module.example.com/app/static/js/main.js',
                    'https://cdn.example.com/module.js',
                    '//cdn.example.com/protocol-relative.js',
                    'data:text/javascript,console.log(1)',
                ],
            }),
        );
        expect(stylesFetcher).toHaveBeenCalledWith(
            expect.objectContaining({
                urls: [
                    'https://module.example.com/app/static/css/main.css',
                    'https://cdn.example.com/module.css',
                    '//cdn.example.com/protocol-relative.css',
                    'blob:https://example.com/style',
                ],
            }),
        );
    });

    it('should resolve root-relative resources against an absolute baseUrl origin', async () => {
        await fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: ['/static/js/main.js'],
            styles: ['/static/css/main.css'],
            baseUrl: 'https://module.example.com/app/',
        });

        expect(scriptsFetcher).toHaveBeenCalledWith(
            expect.objectContaining({
                urls: ['https://module.example.com/static/js/main.js'],
            }),
        );
        expect(stylesFetcher).toHaveBeenCalledWith(
            expect.objectContaining({
                urls: ['https://module.example.com/static/css/main.css'],
            }),
        );
    });

    it('should remove previously mounted link styles outside Safari', async () => {
        const link = document.createElement('link');

        link.setAttribute(DATA_APP_ID_ATTRIBUTE, MODULE_ID);
        document.head.appendChild(link);

        await fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: [],
            styles: [],
            baseUrl: '',
        });

        expect(document.head.contains(link)).toBe(false);
    });

    it('should remove previously mounted inline styles in Safari', async () => {
        (isSafari as jest.Mock).mockReturnValue(true);

        const style = document.createElement('style');

        style.setAttribute(DATA_APP_ID_ATTRIBUTE, MODULE_ID);
        document.head.appendChild(style);

        await fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: [],
            styles: [],
            baseUrl: '',
        });

        expect(document.head.contains(style)).toBe(false);
    });
});

describe('fetchResources — SSR style adoption', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (isSafari as jest.Mock).mockReturnValue(false);
        document.head.innerHTML = '';
    });

    function appendSsrStyle(href: string, tag: 'style' | 'link' = 'style') {
        const element = document.createElement(tag);

        element.setAttribute(DATA_APP_ID_ATTRIBUTE, MODULE_ID);
        element.setAttribute(MODULE_SSR_HREF_ATTRIBUTE, href);
        if (tag === 'link') {
            (element as HTMLLinkElement).rel = 'stylesheet';
            (element as HTMLLinkElement).href = href;
        }
        document.head.appendChild(element);

        return element;
    }

    it('should fetch all styles normally when no SSR tags are present', async () => {
        await fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: [],
            styles: ['/static/css/main.css'],
            baseUrl: '',
        });

        expect(stylesFetcher).toHaveBeenCalledWith(
            expect.objectContaining({ urls: ['/static/css/main.css'] }),
        );
    });

    it('should adopt a matching inline SSR style and not re-fetch it', async () => {
        const ssrStyle = appendSsrStyle('/static/css/main.css');

        await fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: [],
            styles: ['/static/css/main.css'],
            baseUrl: '',
        });

        expect(document.head.contains(ssrStyle)).toBe(true);
        expect(stylesFetcher).toHaveBeenCalledWith(expect.objectContaining({ urls: [] }));
    });

    it('should fetch only the styles that are not covered by SSR tags', async () => {
        appendSsrStyle('/static/css/adopted.css');

        await fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: [],
            styles: ['/static/css/adopted.css', '/static/css/fresh.css'],
            baseUrl: '',
        });

        expect(stylesFetcher).toHaveBeenCalledWith(
            expect.objectContaining({ urls: ['/static/css/fresh.css'] }),
        );
    });

    it('should remove non-matching (stale) SSR style tags', async () => {
        const staleStyle = appendSsrStyle('/static/css/old-version.css');
        const freshSsrStyle = appendSsrStyle('/static/css/main.css');

        await fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: [],
            styles: ['/static/css/main.css'],
            baseUrl: '',
        });

        expect(document.head.contains(staleStyle)).toBe(false);
        expect(document.head.contains(freshSsrStyle)).toBe(true);
    });

    it('should await an adopted <link> style until it loads', async () => {
        const ssrLink = appendSsrStyle('/static/css/main.css', 'link') as HTMLLinkElement;

        let resolved = false;
        const promise = fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: [],
            styles: ['/static/css/main.css'],
            baseUrl: '',
        }).then(() => {
            resolved = true;
        });

        // Пока событие load не пришло, а sheet отсутствует (jsdom), промис не резолвится.
        await Promise.resolve();
        expect(resolved).toBe(false);

        ssrLink.dispatchEvent(new Event('load'));
        await promise;

        expect(resolved).toBe(true);
        expect(document.head.contains(ssrLink)).toBe(true);
    });

    it('should not treat scripts as adoptable', async () => {
        const ssrStyle = appendSsrStyle('/static/js/main.js');

        await fetchResources({
            jsTargetNode: document.head,
            cssTargetNode: document.head,
            cssTargetSelector: undefined,
            moduleId: MODULE_ID,
            scripts: ['/static/js/main.js'],
            styles: [],
            baseUrl: '',
        });

        // js всегда грузится заново, серверных js-тегов не бывает
        expect(scriptsFetcher).toHaveBeenCalledWith(
            expect.objectContaining({ urls: ['/static/js/main.js'] }),
        );
        // а «серверный» тег, не совпавший ни с одним стилем, удаляется
        expect(document.head.contains(ssrStyle)).toBe(false);
    });
});
