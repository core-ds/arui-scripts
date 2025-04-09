import { removeModuleResources, scriptsFetcher, stylesFetcher } from '../dom-utils';

const DATA_APP_ID_ATTRIBUTE = 'data-parent-app-id';
const MODULE_TEST_ID = 'globalSearch';
const SAFARI_USER_AGENT =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15';

const findResourcesNodes = () =>
    document.head.querySelectorAll(`[${DATA_APP_ID_ATTRIBUTE}="${MODULE_TEST_ID}"]`);

describe('dom utils', () => {
    describe('removeModuleResources', () => {
        it('should remove module resources', () => {
            const script = document.createElement('script');
            const link = document.createElement('link');
            const style = document.createElement('style');

            script.setAttribute(DATA_APP_ID_ATTRIBUTE, MODULE_TEST_ID);
            link.setAttribute(DATA_APP_ID_ATTRIBUTE, MODULE_TEST_ID);
            style.setAttribute(DATA_APP_ID_ATTRIBUTE, MODULE_TEST_ID);
            document.head.append(script);
            document.head.append(link);
            document.head.append(style);

            expect(findResourcesNodes().length).toBe(3);

            removeModuleResources({ moduleId: MODULE_TEST_ID, targetNodes: [document.head] });
            expect(findResourcesNodes().length).toBe(0);
        });
        it('should skip remove if no target nodes', () => {
            const script = document.createElement('script');
            const link = document.createElement('link');
            const style = document.createElement('style');

            script.setAttribute(DATA_APP_ID_ATTRIBUTE, MODULE_TEST_ID);
            link.setAttribute(DATA_APP_ID_ATTRIBUTE, MODULE_TEST_ID);
            style.setAttribute(DATA_APP_ID_ATTRIBUTE, MODULE_TEST_ID);
            document.head.append(script);
            document.head.append(link);
            document.head.append(style);

            expect(findResourcesNodes().length).toBe(3);

            removeModuleResources({ moduleId: MODULE_TEST_ID, targetNodes: [undefined] });
            expect(findResourcesNodes().length).toBe(3);

            removeModuleResources({ moduleId: MODULE_TEST_ID, targetNodes: [document.head] });
        });
    });

    describe('resource fetchers', () => {
        let timerId: ReturnType<typeof setTimeout>;

        beforeEach(() => {
            global.fetch = jest.fn(async () => ({ text: async () => '' })) as jest.Mock;
            removeModuleResources({ moduleId: MODULE_TEST_ID, targetNodes: [document.head] });

            timerId = setTimeout(() => {
                findResourcesNodes().forEach((node) => {
                    node.dispatchEvent(new Event('load'));
                });
            });
        });

        afterEach(() => {
            jest.restoreAllMocks();
            global.fetch = undefined as never;
            clearTimeout(timerId);
        });

        it('should fetch scripts', async () => {
            await scriptsFetcher({
                urls: ['https://example.com/script.js'],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });

            const nodes = findResourcesNodes();

            expect(nodes.length).toBe(1);
            expect(nodes[0].tagName).toBe('SCRIPT');
            expect((nodes[0] as HTMLScriptElement).src).toBe('https://example.com/script.js');
            expect(nodes[0].getAttribute(DATA_APP_ID_ATTRIBUTE)).toBe(MODULE_TEST_ID);
        });

        it('should fetch styles', async () => {
            await stylesFetcher({
                urls: ['https://example.com/style.css'],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });

            const nodes = findResourcesNodes();

            expect(nodes.length).toBe(1);
            expect(nodes[0].tagName).toBe('LINK');
            expect((nodes[0] as HTMLLinkElement).href).toBe('https://example.com/style.css');
            expect(nodes[0].getAttribute(DATA_APP_ID_ATTRIBUTE)).toBe(MODULE_TEST_ID);
        });

        it('should inject inline styles in Safari', async () => {
            jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(SAFARI_USER_AGENT);

            await stylesFetcher({
                urls: ['https://example.com/style.css'],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });

            const nodes = findResourcesNodes();

            expect(nodes.length).toBe(1);
            expect(nodes[0].tagName).toBe('STYLE');
            expect(nodes[0].getAttribute(DATA_APP_ID_ATTRIBUTE)).toBe(MODULE_TEST_ID);
        });

        it('should create link instead of style tag if disableInlineStyleSafari = true in Safari', async () => {
            jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(SAFARI_USER_AGENT);

            await stylesFetcher({
                urls: ['https://example.com/style.css'],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
                disableInlineStyleSafari: true,
            });

            const nodes = findResourcesNodes();

            expect(nodes.length).toBe(1);
            expect(nodes[0].tagName).toBe('LINK');
            expect(nodes[0].getAttribute(DATA_APP_ID_ATTRIBUTE)).toBe(MODULE_TEST_ID);
        });

        it('should not inject resources if the abort signal is aborted', async () => {
            const abortController = new AbortController();

            abortController.abort();

            try {
                await scriptsFetcher({
                    urls: ['https://example.com/script.js'],
                    targetNode: document.head,
                    attributes: {
                        [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                    },
                    abortSignal: abortController.signal,
                });
            } catch (error) {
                expect((error as Error).toString()).toBe('Error: The operation was aborted.');
            }

            const nodes = findResourcesNodes();

            expect(nodes.length).toBe(0);
        });

        it('should not inject resources if the abort signal is aborted in Safari', async () => {
            jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(SAFARI_USER_AGENT);

            const abortController = new AbortController();

            abortController.abort();

            try {
                await stylesFetcher({
                    urls: ['https://example.com/style.css'],
                    targetNode: document.head,
                    attributes: {
                        [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                    },
                    abortSignal: abortController.signal,
                });
            } catch (error) {
                expect((error as Error).toString()).toBe('Error: The operation was aborted.');
            }

            const nodes = findResourcesNodes();

            expect(nodes.length).toBe(0);
        });

        it('should not inject resources if has load error', async () => {
            clearTimeout(timerId);
            timerId = setTimeout(() => {
                findResourcesNodes().forEach((node) => {
                    node.dispatchEvent(new Event('error'));
                });
            });

            try {
                await scriptsFetcher({
                    urls: ['https://example.com/script.js'],
                    targetNode: document.head,
                    attributes: {
                        [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                    },
                    abortSignal: undefined,
                });
            } catch (error) {
                expect((error as Error).toString()).toBe('[object Event]');
            }

            const nodes = findResourcesNodes();

            expect(nodes.length).toBe(0);
        });
    });
});
