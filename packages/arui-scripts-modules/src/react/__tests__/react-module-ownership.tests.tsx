import React from 'react';
import { act, render, waitFor } from '@testing-library/react';

import { useModuleMounter } from '../../module-loader/hooks/use-module-mounter';
import { type ModuleResources } from '../../module-loader/types';
import { createReactModule } from '../create-react-module';

const state = { baseUrl: '/', hostAppId: 'host' };

it('не снимает работающий экземпляр, если второй mounter не смог занять тот же контейнер', async () => {
    const sharedNode = document.createElement('div');
    const module = createReactModule({ Component: () => <span>работает</span> });
    const moduleResources: ModuleResources = {
        scripts: [],
        styles: [],
        moduleVersion: '1',
        appName: 'test',
        mountMode: 'compat',
        moduleState: state,
    };
    const firstRelease = jest.fn();
    const secondRelease = jest.fn();
    const loader = jest
        .fn()
        .mockResolvedValueOnce({ module, moduleResources, unmount: firstRelease })
        .mockResolvedValueOnce({ module, moduleResources, unmount: secondRelease });
    const createTargetNode = () => sharedNode;
    const firstReady = jest.fn();
    const firstError = jest.fn();
    const secondError = jest.fn();

    function Host({ onError, onReady }: { onError: jest.Mock; onReady?: jest.Mock }) {
        const { targetElementRef } = useModuleMounter({
            loader,
            createTargetNode,
            onError,
            onReady,
        });

        return <div ref={targetElementRef} />;
    }

    const view = render(<Host onError={firstError} onReady={firstReady} />);

    await waitFor(() => expect(firstReady).toHaveBeenCalledTimes(1));
    expect(sharedNode.textContent).toBe('работает');

    view.rerender(
        <React.Fragment>
            <Host onError={firstError} onReady={firstReady} />
            <Host onError={secondError} />
        </React.Fragment>,
    );

    await waitFor(() =>
        expect(secondError).toHaveBeenCalledWith({
            error: new Error('React-модуль уже смонтирован в этом контейнере'),
            stage: 'mount',
        }),
    );
    await act(async () => {
        await Promise.resolve();
    });
    expect(firstError).not.toHaveBeenCalled();
    expect(secondRelease).toHaveBeenCalledTimes(1);
    expect(firstRelease).not.toHaveBeenCalled();
    expect(sharedNode.textContent).toBe('работает');

    await act(async () => view.unmount());
    expect(firstRelease).toHaveBeenCalledTimes(1);
    expect(secondRelease).toHaveBeenCalledTimes(1);
    expect(sharedNode.textContent).toBe('');
});
