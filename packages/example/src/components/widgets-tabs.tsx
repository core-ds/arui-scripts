import React, { useState } from 'react';
import { TabsDesktop, Tab } from '@alfalab/core-components/tabs/desktop';
import { ClientWidgetMounter } from 'Src/widget-mounters/client-widget-mounter';
import { Typography } from '@alfalab/core-components/typography';
import { MFWidgetMounter } from 'Src/widget-mounters/mf-widget-mounter';
import { ServerLegacyWidgetMounter } from 'Src/widget-mounters/server-legacy-widget-mounter';
import { ServerMfWidgetMounter } from 'Src/widget-mounters/server-mf-widget-mounter';

const tabs = {
    '1': {
        title: 'Client-only legacy widget',
        description: 'Такие виджеты могут быть реализованы без каких либо изменений на сервере - они просто монтируются на клиенте',
        component: ClientWidgetMounter,
    },
    '2': {
        title: 'MF modules',
        description: 'Виджеты, созданные с помощью module-federation',
        component: MFWidgetMounter,
    },
    '3': {
        title: 'Server legacy widget',
        description: '',
        component: ServerLegacyWidgetMounter,
    },
    '4': {
        title: 'Server MF widget',
        description: '',
        component: ServerMfWidgetMounter,
    }
} as const;

type TabId = keyof typeof tabs;

export const WidgetsTabs = () => {
    const [activeTab, setActiveTab] = useState<TabId>('1');

    return (
        <div>
            <TabsDesktop
                selectedId={activeTab}
                onChange={(_, { selectedId }) => { setActiveTab(selectedId as TabId) }}
            >
            { Object.keys(tabs).map((tabKey) => (
                <Tab id={tabKey} title={tabs[tabKey as TabId].title} key={tabKey} />
            )) }
            </TabsDesktop>

            <div>
                <Typography.Text>
                    { tabs[activeTab].description }
                </Typography.Text>
                { React.createElement(tabs[activeTab].component)}
            </div>
        </div>
    )
}
