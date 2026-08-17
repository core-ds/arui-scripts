import { Component, type ErrorInfo } from 'react';

import { type PanelErrorBoundaryProps, type PanelErrorBoundaryState } from '../types';

/**
 * Панель не имеет права ронять приложение, в которое её инжектнули, и не должна ломаться
 * сама: снимок может приехать из sessionStorage от другой версии загрузчика и споткнуть
 * отрисовку. Пропускаем кадр, говорим об этом и пробуем снова на следующем обновлении.
 */
export class PanelErrorBoundary extends Component<
    PanelErrorBoundaryProps,
    PanelErrorBoundaryState
> {
    state: PanelErrorBoundaryState = { failed: false, resetKey: this.props.resetKey };

    static getDerivedStateFromError(): Partial<PanelErrorBoundaryState> {
        return { failed: true };
    }

    static getDerivedStateFromProps(
        props: PanelErrorBoundaryProps,
        state: PanelErrorBoundaryState,
    ): Partial<PanelErrorBoundaryState> | null {
        if (props.resetKey !== state.resetKey) {
            return { failed: false, resetKey: props.resetKey };
        }

        return null;
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        // eslint-disable-next-line no-console -- падение отрисовки должно быть видно в консоли
        console.error('[arui devtools] не удалось отрисовать панель', error, info.componentStack);
    }

    render() {
        if (this.state.failed) {
            return (
                <div className='status status_error'>
                    Не удалось отрисовать панель, подробности в консоли.
                </div>
            );
        }

        return this.props.children;
    }
}
