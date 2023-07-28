import React, { useState } from 'react';
import { TabsDesktop, Tab } from '@alfalab/core-components/tabs/desktop';
import { CompatModuleMounter } from '#/module-mounters/compat-module-mounter';
import { Typography } from '@alfalab/core-components/typography';
import { ModuleMounter } from '#/module-mounters/module-mounter';
import { ServerStateCompatModuleMounter } from '#/module-mounters/server-state-compat-module-mounter';
import { ServerStateModuleMounter } from '#/module-mounters/server-state-module-mounter';
import {AbstractModule} from "#/module-mounters/abstract-module";

const tabs = {
    '1': {
        title: 'Default module',
        description: 'Стандартный модуль, который может быть подключен через default режим',
        component: ModuleMounter,
    },
    '2': {
        title: 'Compat module',
        description: 'Модуль, сделанный через compat режим, умеет изолировать стили и работать в любом проекте',
        component: CompatModuleMounter,
    },
    '3': {
        title: 'Server state module',
        description: 'Модуль, имеющий серверную часть, которая может отдавать предподготовленные данные на клиент при загрузке',
        component: ServerStateModuleMounter,
    },
    '4': {
        title: 'Server state compat module',
        description: 'Модуль, имеющий серверную часть, которая может отдавать предподготовленные данные на клиент при загрузке, сделанный через compat режим',
        component: ServerStateCompatModuleMounter,
    },
    '5': {
        title: 'Abstract module',
        description: 'НЕ монтируемый модуль, который просто предоставляет какие то функции',
        component: AbstractModule,
    }
} as const;

type TabId = keyof typeof tabs;

export const ModulesTabs = () => {
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