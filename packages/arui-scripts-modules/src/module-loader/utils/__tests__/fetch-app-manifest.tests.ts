import { fetchAppManifest } from '../fetch-app-manifest';

describe('fetchAppManifest', () => {
    let xhrMock = {
        open: jest.fn(),
        send: jest.fn(),
        setRequestHeader: jest.fn(),
        onload: jest.fn(),
        onerror: jest.fn(),
        status: 200,
        responseText: '',
        statusText: '',
    };

    beforeEach(() => {
        window.XMLHttpRequest = jest.fn(() => xhrMock) as any;
        xhrMock = {
            open: jest.fn(),
            send: jest.fn(),
            setRequestHeader: jest.fn(),
            onload: jest.fn(),
            onerror: jest.fn(),
            status: 200,
            responseText: '',
            statusText: '',
        };
    });

    it('should return parsed manifest', async () => {
        xhrMock.responseText = JSON.stringify('Hello World!');
        const manifestPromise = fetchAppManifest('http://test/manifest.json');

        xhrMock.onload?.({} as any);

        await expect(manifestPromise).resolves.toEqual('Hello World!');
    });

    it('should reject promise if status is not 200', async () => {
        xhrMock.status = 404;
        xhrMock.statusText = 'Not Found';
        const manifestPromise = fetchAppManifest('http://test/manifest.json');

        xhrMock.onload();

        await expect(manifestPromise).rejects.toEqual(new Error('Not Found'));
    });

    it('should reject promise if request was errored', async () => {
        const manifestPromise = fetchAppManifest('http://test/manifest.json');

        xhrMock.onerror();

        await expect(manifestPromise).rejects.toEqual(new Error(''));
    });
});
