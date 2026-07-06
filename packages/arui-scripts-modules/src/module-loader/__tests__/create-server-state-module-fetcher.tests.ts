import { createServerStateModuleFetcher } from '../create-server-state-module-fetcher';
import { urlSegmentWithoutEndSlash } from '../utils/normalize-url-segment';

jest.mock('../utils/normalize-url-segment');

describe('createServerStateModuleFetcher', () => {
    const mockFetch = jest.fn();
    let oldFetch: typeof global.fetch;

    function mockResponse({
        ok = true,
        statusText = 'OK',
        json = {},
    }: {
        ok?: boolean;
        statusText?: string;
        json?: unknown;
    }) {
        mockFetch.mockResolvedValueOnce({
            ok,
            statusText,
            json: jest.fn().mockResolvedValue(json),
        });
    }

    beforeAll(() => {
        oldFetch = global.fetch;
        global.fetch = mockFetch as unknown as typeof global.fetch;
        (urlSegmentWithoutEndSlash as jest.Mock).mockReturnValue('https://test.com');
    });

    afterAll(() => {
        global.fetch = oldFetch;
    });

    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should perform a POST request with the correct url, headers and body', async () => {
        mockResponse({ json: {} });

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

        await fetchServerResources(fetchParams);

        expect(mockFetch).toHaveBeenCalledWith('https://test.com/api/getModuleResources', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-test': 'test',
            },
            body: JSON.stringify(fetchParams),
            signal: undefined,
        });
    });

    it('should pass the abort signal through to fetch', async () => {
        mockResponse({ json: {} });

        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com/',
        });
        const controller = new AbortController();

        await fetchServerResources(
            {
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
            },
            { signal: controller.signal },
        );

        expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ signal: controller.signal }),
        );
    });

    it('should resolve with the parsed json response', async () => {
        const responseBody = { scripts: [], styles: [] };

        mockResponse({ json: responseBody });

        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com/',
        });

        await expect(
            fetchServerResources({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
            }),
        ).resolves.toEqual(responseBody);
    });

    it('should reject when the response is not ok', async () => {
        mockResponse({ ok: false, statusText: 'Bad Request' });

        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com',
        });

        await expect(
            fetchServerResources({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
            }),
        ).rejects.toEqual(new Error('Bad Request'));
    });

    it('should reject when fetch rejects (network error)', async () => {
        mockFetch.mockRejectedValueOnce(new Error('network error'));

        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com',
        });

        await expect(
            fetchServerResources({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
            }),
        ).rejects.toEqual(new Error('network error'));
    });
});
