import { scriptsFetcher, stylesFetcher } from '../dom-utils';
import { fetchResources } from '../fetch-resources';
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
