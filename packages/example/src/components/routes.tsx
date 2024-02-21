import React from 'react';
import { Route,Switch } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

import { Gap } from '@alfalab/core-components/gap';
import { Link } from '@alfalab/core-components/link';

import { App } from '#/components/app';
import { ModuleMounter } from '#/module-mounters/module-mounter';

const moduleRunParams = {
    contextRoot: '/module-router',
};

export const Routes = () => (
        <div>
            <h1>Routes</h1>

            <Link Component={RouterLink} href="/">Home</Link>
            <Gap size='m' />
            <Link Component={RouterLink} href="/module-router">About</Link>

            <Switch>
                <Route path="/" exact={true}>
                    <App />
                </Route>
                <Route path="/module-router">
                    <h1>Module Router</h1>

                    <ModuleMounter runParams={ moduleRunParams } />
                </Route>
            </Switch>
        </div>
    )
