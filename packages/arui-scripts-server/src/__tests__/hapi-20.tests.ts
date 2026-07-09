import { createGetModulesHapi20Plugin } from '../hapi-20';

describe('createGetModulesHapi20Plugin', () => {
    function getRouteConfig(routeParams?: Record<string, unknown>) {
        const plugin = createGetModulesHapi20Plugin({}, routeParams);
        const server = {
            route: jest.fn(),
        };

        plugin.register(server as never, {} as never);

        return server.route.mock.calls[0][0];
    }

    it('should ignore csrf check by default', () => {
        const routeConfig = getRouteConfig();

        expect(routeConfig.options).toMatchObject({
            plugins: {
                crumb: {
                    ignore: true,
                },
            },
        });
    });

    it('should keep additional route plugins', () => {
        const routeConfig = getRouteConfig({
            auth: false,
            plugins: {
                crumb: {
                    key: 'custom-crumb-key',
                },
                customPlugin: {
                    enabled: true,
                },
            },
        });

        expect(routeConfig.options).toMatchObject({
            auth: false,
            plugins: {
                crumb: {
                    key: 'custom-crumb-key',
                    ignore: true,
                },
                customPlugin: {
                    enabled: true,
                },
            },
        });
    });
});
