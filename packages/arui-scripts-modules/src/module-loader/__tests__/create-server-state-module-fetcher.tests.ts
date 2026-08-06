import { createServerStateModuleFetcher } from '../create-server-state-module-fetcher';
import { urlSegmentWithoutEndSlash } from '../utils/normalize-url-segment';

jest.mock('../utils/normalize-url-segment');

describe('createServerStateModuleFetcher', () => {
    const mockFetch = jest.fn();
    let oldFetch: typeof global.fetch;

    function mockResponse({
        ok = true,
        status = 200,
        statusText = 'OK',
        json = {},
        text = '',
    }: {
        ok?: boolean;
        status?: number;
        statusText?: string;
        json?: unknown;
        text?: string;
    }) {
        mockFetch.mockResolvedValueOnce({
            ok,
            status,
            statusText,
            json: jest.fn().mockResolvedValue(json),
            text: jest.fn().mockResolvedValue(text),
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

    it('should reject with status and response body when the response is not ok', async () => {
        mockResponse({
            ok: false,
            status: 400,
            statusText: 'Bad Request',
            text: '{"error":"invalid"}',
        });

        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com',
        });

        await expect(
            fetchServerResources({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
            }),
        ).rejects.toEqual(
            new Error(
                'Module resources request for test failed: https://test.com/api/getModuleResources responded with 400 Bad Request\n{"error":"invalid"}',
            ),
        );
    });

    it('should reject with status even when statusText is empty and body is not readable', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: '',
            text: jest.fn().mockRejectedValue(new Error('body read failed')),
        });

        const fetchServerResources = createServerStateModuleFetcher({
            baseUrl: 'https://test.com',
        });

        await expect(
            fetchServerResources({
                moduleId: 'test',
                hostAppId: 'test',
                params: undefined,
            }),
        ).rejects.toEqual(
            new Error(
                'Module resources request for test failed: https://test.com/api/getModuleResources responded with 500',
            ),
        );
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
