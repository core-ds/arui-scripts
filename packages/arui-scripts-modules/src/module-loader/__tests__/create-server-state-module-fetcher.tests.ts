import { createServerStateModuleFetcher } from '../create-server-state-module-fetcher';
import { MODULE_OVERRIDES_STORAGE_KEY } from '../utils/module-overrides';
import { urlSegmentWithoutEndSlash } from '../utils/normalize-url-segment';

jest.mock('../utils/normalize-url-segment');

describe('createServerStateModuleFetcher', () => {
    const mockXHR = {
        open: jest.fn(),
        send: jest.fn(),
        setRequestHeader: jest.fn(),
        onload: null as null | (() => void),
        onerror: null as null | (() => void),
        statusText: 'status',
        responseText: '{}',
        status: 200,
    };
    let oldXMLHttpRequest: typeof XMLHttpRequest;

    beforeAll(() => {
        oldXMLHttpRequest = window.XMLHttpRequest;
        window.XMLHttpRequest = jest.fn(() => mockXHR) as unknown as typeof XMLHttpRequest;
        (urlSegmentWithoutEndSlash as jest.Mock).mockReturnValue('https://test.com');
    });

    afterAll(() => {
        window.XMLHttpRequest = oldXMLHttpRequest;
    });

    it('should create a server state module fetcher correctly', async () => {
        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com/',
            headers: {
                'x-test': 'test',
            },
        });
        const fetchParams = {
            moduleId: 'test',
            hostAppId: 'test',
            params: undefined,
        };

        fetchServerResources(fetchParams);

        expect(mockXHR.open).toHaveBeenCalledWith(
            'POST',
            'https://test.com/api/getModuleResources',
            true,
        );
        expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(mockXHR.setRequestHeader).toHaveBeenCalledWith('x-test', 'test');
        expect(mockXHR.send).toHaveBeenCalledWith(JSON.stringify(fetchParams));
    });

    it('should handle xhr load event correctly', async () => {
        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com/',
        });

        const promise = fetchServerResources({
            moduleId: 'test',
            hostAppId: 'test',
            params: undefined,
        });

        mockXHR.onload?.();

        await expect(promise).resolves.toEqual(JSON.parse(mockXHR.responseText));
    });

    it('should handle xhr error event correctly', async () => {
        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com/',
        });

        const promise = fetchServerResources({
            moduleId: 'test',
            hostAppId: 'test',
            params: undefined,
        });

        mockXHR.onerror?.();

        await expect(promise).rejects.toEqual(new Error(mockXHR.statusText));
    });

    it('should reject the promise when the response status is not 200', async () => {
        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com',
        });

        mockXHR.status = 400;

        const promise = fetchServerResources({
            moduleId: 'test',
            hostAppId: 'test',
            params: undefined,
        });

        mockXHR.onload?.();

        await expect(promise).rejects.toEqual(new Error(mockXHR.statusText));
    });

    describe('dev overrides', () => {
        beforeEach(() => {
            mockXHR.status = 200;
            jest.spyOn(console, 'warn').mockImplementation(() => undefined);
            (urlSegmentWithoutEndSlash as jest.Mock).mockImplementation((url: string) =>
                url.replace(/\/$/, ''),
            );
            window.localStorage.setItem(
                MODULE_OVERRIDES_STORAGE_KEY,
                JSON.stringify({ test: 'http://localhost:8081' }),
            );
        });

        afterEach(() => {
            window.localStorage.clear();
            jest.restoreAllMocks();
            (urlSegmentWithoutEndSlash as jest.Mock).mockReturnValue('https://test.com');
        });

        it('should send the request to the overridden host', () => {
            const fetchServerResources = createServerStateModuleFetcher({
                baseUrl: 'https://test.com/',
            });

            fetchServerResources({ moduleId: 'test', hostAppId: 'host', params: undefined });

            expect(mockXHR.open).toHaveBeenCalledWith(
                'POST',
                'http://localhost:8081/api/getModuleResources',
                true,
            );
        });

        it('should force the overridden base url into the module state', async () => {
            // локальный сервер модуля вполне может вернуть адрес стенда, захардкоженный в его конфиге,
            // поэтому baseUrl из ответа доверять нельзя - подмена должна выигрывать
            mockXHR.responseText = JSON.stringify({
                scripts: ['remoteEntry.js'],
                styles: [],
                moduleVersion: '1.0',
                appName: 'test_app',
                mountMode: 'default',
                moduleState: { baseUrl: 'https://test.com', hostAppId: 'host' },
            });

            const fetchServerResources = createServerStateModuleFetcher({
                baseUrl: 'https://test.com/',
            });

            const promise = fetchServerResources({
                moduleId: 'test',
                hostAppId: 'host',
                params: undefined,
            });

            mockXHR.onload?.();

            await expect(promise).resolves.toMatchObject({
                moduleState: { baseUrl: 'http://localhost:8081', hostAppId: 'host' },
            });
        });

        it('should not affect modules without an override', () => {
            const fetchServerResources = createServerStateModuleFetcher({
                baseUrl: 'https://test.com/',
            });

            fetchServerResources({ moduleId: 'other', hostAppId: 'host', params: undefined });

            expect(mockXHR.open).toHaveBeenCalledWith(
                'POST',
                'https://test.com/api/getModuleResources',
                true,
            );
        });
    });
});
