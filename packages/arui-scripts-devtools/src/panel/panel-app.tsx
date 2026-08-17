import { Fragment, useMemo, useState } from 'react';

import { PANEL_TABS } from '../constants';
import { type PanelAppProps, type PanelBodyProps, type PanelTabId } from '../types';
import { readPanelState, writePanelState } from '../utils/panel-state';
import { analyzeShareScopes, countShareProblems } from '../utils/share-scope';

import { PanelErrorBoundary } from './error-boundary';
import { EventsView } from './events-view';
import { LoadsTable } from './loads-table';
import { OverridesView, toOrigin } from './overrides-view';
import { ShareScopeView } from './share-scope-view';
import { TimelineView } from './timeline-view';
import { useModulesStore } from './use-modules-store';

function restoreActiveTab(): PanelTabId {
    const stored = readPanelState().tab;
    const known = PANEL_TABS.find((tab) => tab.id === stored);

    // неизвестный id из хранилища - например, вкладка из будущей версии - не должен
    // оставить панель без активной вкладки
    return known ? known.id : PANEL_TABS[0].id;
}

/**
 * Строка состояния и тело активной вкладки.
 *
 * Всё, что читает снимок стора, живёт здесь - под границей ошибок: снимок мог приехать
 * из sessionStorage от другой версии загрузчика и споткнуть отрисовку.
 */
function PanelBody({
    state,
    activeTab,
    scopes,
    providerOrigins,
    expandedLoads,
    onToggleLoad,
    loadsQuery,
    onLoadsQueryChange,
    eventsQuery,
    onEventsQueryChange,
    eventsOnlyErrors,
    onEventsOnlyErrorsChange,
}: PanelBodyProps) {
    const snapshot = state.status === 'ready' ? state.snapshot : undefined;
    const loads = snapshot?.loads ?? [];
    const events = snapshot?.events ?? [];

    let statusText = `Загрузок: ${loads.length} · событий: ${events.length}`;

    if (state.status === 'unsupported') {
        statusText = `Стор devtools версии ${state.found}, панель умеет читать ${state.supported}. Обновите @alfalab/scripts-devtools или @alfalab/scripts-modules.`;
    } else if (state.status === 'waiting') {
        statusText = 'Ждём загрузчик модулей: ни один модуль ещё не загружался.';
    }

    let content = (
        <LoadsTable
            loads={loads}
            query={loadsQuery}
            onQueryChange={onLoadsQueryChange}
            expanded={expandedLoads}
            onToggle={onToggleLoad}
        />
    );

    if (activeTab === 'events') {
        content = (
            <EventsView
                events={events}
                query={eventsQuery}
                onQueryChange={onEventsQueryChange}
                onlyErrors={eventsOnlyErrors}
                onOnlyErrorsChange={onEventsOnlyErrorsChange}
            />
        );
    } else if (activeTab === 'timeline') {
        content = <TimelineView loads={loads} />;
    } else if (activeTab === 'overrides') {
        content = <OverridesView origins={providerOrigins} />;
    } else if (activeTab === 'share-scope') {
        content = <ShareScopeView scopes={scopes} />;
    }

    return (
        <Fragment>
            <div className={`status${state.status === 'unsupported' ? ' status_error' : ''}`}>
                {statusText}
            </div>
            <div className='body'>{content}</div>
        </Fragment>
    );
}

/**
 * Корень панели: шапка, вкладки, строка состояния и содержимое активной вкладки.
 *
 * Состояние вкладок и фильтров живёт здесь, а не во вкладках: оно должно переживать
 * и переключение вкладок, и повторную попытку отрисовки после ошибки.
 */
export function PanelApp({ source, onClose }: PanelAppProps) {
    const state = useModulesStore(source);
    const [activeTab, setActiveTab] = useState<PanelTabId>(restoreActiveTab);
    const [expandedLoads, setExpandedLoads] = useState<ReadonlySet<string>>(() => new Set());
    const [loadsQuery, setLoadsQuery] = useState('');
    const [eventsQuery, setEventsQuery] = useState('');
    const [eventsOnlyErrors, setEventsOnlyErrors] = useState(false);

    // Скоуп приезжает в снимке: сам `__webpack_share_scopes__` панели не виден - его снимает
    // загрузчик. Разбираем на каждый снимок, даже с закрытой вкладкой: число проблем
    // показывается в её заголовке, то есть нужно до открытия.
    const scopes = useMemo(
        () => analyzeShareScopes(state.status === 'ready' ? state.snapshot.shareScopes : undefined),
        [state],
    );

    // адреса провайдеров, встреченные в диагностике: подменять есть смысл только их,
    // а вводить руками - лишний способ ошибиться в адресе
    const providerOrigins = useMemo(() => {
        const loads = state.status === 'ready' ? state.snapshot.loads : [];
        const found = new Set<string>();

        loads.forEach((record) => {
            [record.baseUrl, record.manifestUrl].forEach((url) => {
                const origin = toOrigin(url);

                if (origin) {
                    found.add(origin);
                }
            });
        });

        return Array.from(found).sort();
    }, [state]);
    const problems = countShareProblems(scopes);

    const selectTab = (tab: PanelTabId) => {
        setActiveTab(tab);
        writePanelState({ tab });
    };

    const toggleLoad = (loadId: string) => {
        setExpandedLoads((previous) => {
            const next = new Set(previous);

            if (next.has(loadId)) {
                next.delete(loadId);
            } else {
                next.add(loadId);
            }

            // раскрытые id вытесненных из кольцевого буфера записей не чистим нарочно:
            // строки таких записей больше не рендерятся, а loadId уникальны на страницу -
            // ложного раскрытия чужой строки не случится
            return next;
        });
    };

    return (
        <div className='panel' role='complementary' aria-label='arui devtools'>
            <div className='header'>
                <div className='title'>arui devtools</div>
                {/* у расширения крестика нет: панель занимает вкладку целиком */}
                {onClose && (
                    <button
                        type='button'
                        className='button button_icon close'
                        title='Закрыть (Esc)'
                        aria-label='Закрыть панель'
                        onClick={onClose}
                    >
                        ✕
                    </button>
                )}
            </div>
            <div className='tabs' role='tablist'>
                {PANEL_TABS.map((tab) => {
                    const note = tab.id === 'share-scope' && problems ? `проблем: ${problems}` : '';

                    return (
                        <button
                            type='button'
                            role='tab'
                            key={tab.id}
                            className={`tab${tab.id === activeTab ? ' tab_active' : ''}`}
                            aria-selected={tab.id === activeTab}
                            onClick={() => selectTab(tab.id)}
                        >
                            {note ? `${tab.title} · ${note}` : tab.title}
                        </button>
                    );
                })}
            </div>
            <PanelErrorBoundary resetKey={state}>
                <PanelBody
                    state={state}
                    activeTab={activeTab}
                    scopes={scopes}
                    providerOrigins={providerOrigins}
                    expandedLoads={expandedLoads}
                    onToggleLoad={toggleLoad}
                    loadsQuery={loadsQuery}
                    onLoadsQueryChange={setLoadsQuery}
                    eventsQuery={eventsQuery}
                    onEventsQueryChange={setEventsQuery}
                    eventsOnlyErrors={eventsOnlyErrors}
                    onEventsOnlyErrorsChange={setEventsOnlyErrors}
                />
            </PanelErrorBoundary>
        </div>
    );
}
