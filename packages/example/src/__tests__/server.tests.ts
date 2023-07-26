import hapi from '@hapi/hapi';

describe('server side tests', () => {
    let server: hapi.Server;

    beforeEach(() => {
        server = hapi.server({
            port: 4137,
            host: 'localhost',
        });
    });

    afterEach(() => {
        server.stop();
    });

    it('should work', () => {
        expect(1 + 1).toBe(2);
    });
})
