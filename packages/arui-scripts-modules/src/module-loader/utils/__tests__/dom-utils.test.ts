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

        it('should not duplicate script tags for the same URL', async () => {
            await scriptsFetcher({
                urls: ['https://example.com/duplicate-script.js'],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });
            await scriptsFetcher({
                urls: ['https://example.com/duplicate-script.js'],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });

            const scripts = Array.from(
                document.head.querySelectorAll<HTMLScriptElement>('script[src]'),
            ).filter((s) => s.src === 'https://example.com/duplicate-script.js');

            expect(scripts.length).toBe(1);
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

        it('should not duplicate link styles for the same URL', async () => {
            await stylesFetcher({
                urls: ['https://example.com/duplicate-style.css'],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });
            await stylesFetcher({
                urls: ['https://example.com/duplicate-style.css'],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });

            const links = Array.from(
                document.head.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]'),
            ).filter((l) => l.href === 'https://example.com/duplicate-style.css');

            expect(links.length).toBe(1);
        });

        it('should inject inline styles in Safari', async () => {
            jest.useFakeTimers();
            jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(SAFARI_USER_AGENT);

            const vendorHref = '/vendor-style.css';
            const mainHref = '/main-style.css';
            const vendorStyle = '.container { color: red; }';
            const mainStyle = '.slider { color: red; }';

            const mockFetch = jest.fn((href: RequestInfo | URL): Promise<Response> => {
                if (href.toString().includes(vendorHref)) {
                    return new Promise((resolve) => {
                        setTimeout(
                            () => resolve({ text: () => Promise.resolve(vendorStyle) } as Response),
                            1000,
                        );
                    });
                }

                return Promise.resolve({ text: () => Promise.resolve(mainStyle) } as Response);
            });

            const spyFetch = jest.spyOn(global, 'fetch').mockImplementation(mockFetch);

            const fetcherPromise = stylesFetcher({
                urls: [`https://example.com${vendorHref}`, `https://example.com${mainHref}`],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });

            jest.runAllTimers();

            await fetcherPromise;

            const nodes = findResourcesNodes();

            expect(nodes.length).toBe(2);
            expect(nodes[0].tagName).toBe('STYLE');
            expect(nodes[0].getAttribute(DATA_APP_ID_ATTRIBUTE)).toBe(MODULE_TEST_ID);

            expect(nodes[0].textContent).toBe(vendorStyle);
            expect(nodes[1].textContent).toBe(mainStyle);

            spyFetch.mockReset();
            jest.useRealTimers();
        });

        it('should not duplicate inline style tags in Safari for the same URL', async () => {
            jest.spyOn(navigator, 'userAgent', 'get').mockReturnValue(SAFARI_USER_AGENT);
            const href = 'https://example.com/inline.css';

            (global.fetch as unknown as jest.Mock) = jest
                .fn()
                .mockResolvedValue({ text: async () => '.a{color:red;}' });

            await stylesFetcher({
                urls: [href],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });
            await stylesFetcher({
                urls: [href],
                targetNode: document.head,
                attributes: {
                    [DATA_APP_ID_ATTRIBUTE]: MODULE_TEST_ID,
                },
                abortSignal: undefined,
            });

            const styles = Array.from(
                document.head.querySelectorAll<HTMLStyleElement>('style[data-resource-url]'),
            ).filter((s) => s.getAttribute('data-resource-url') === href);

            expect(styles.length).toBe(1);
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
