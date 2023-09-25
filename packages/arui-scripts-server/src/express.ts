import { Request, Router } from 'express';

import { createGetModulesMethod, ModulesConfig } from './modules';

export function createGetModulesExpress(modules: ModulesConfig<[Request]>): Router {
    const router = Router();

    const modulesMethodSettings = createGetModulesMethod(modules);

    (router as unknown as Record<string, typeof router.post>)[
        modulesMethodSettings.method.toLowerCase()
    ](modulesMethodSettings.path, async (req, res) => {
        try {
            const response = await modulesMethodSettings.handler(req.body, req);

            res.send(response);
        } catch (e: any) {
            res.status(500).send({
                error: e.message,
                status: 500,
            });
        }
    });

    return router;
}
