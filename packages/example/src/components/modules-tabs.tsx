import React, { useState } from 'react';
import { TabsDesktop, Tab } from '@alfalab/core-components/tabs/desktop';
import { EmbeddedModuleMounter } from '#/module-mounters/embedded-module-mounter';
import { Typography } from '@alfalab/core-components/typography';
import { MfModuleMounter } from '#/module-mounters/mf-module-mounter';
import { ServerEmbeddedModuleMounter } from '#/module-mounters/server-embedded-module-mounter';
import { ServerMfModuleMounter } from '#/module-mounters/server-mf-module-mounter';
import {AbstractModule} from "#/module-mounters/abstract-module";

const tabs = {
    '1': {
        title: 'Client-only embedded module',
        description: 'Такие модули могут быть реализованы без каких либо доработок на стороне сервера',
        component: EmbeddedModuleMounter,
    },
    '2': {
        title: 'Client-only MF module',
        description: 'Модуль, созданный с помощью module-federation, опять же реализован как клиентский код',
        component: MfModuleMounter,
    },
    '3': {
        title: 'Server embedded module',
        description: 'Модуль, подключенный через legacy режим. У него так же есть серверная часть, которая может отдавать предподготовленные данные на клиент при загрузке',
        component: ServerEmbeddedModuleMounter,
    },
    '4': {
        title: 'Server MF module',
        description: 'Модуль, подключенный через module-federation режим. У него так же есть серверная часть, которая может отдавать предподготовленные данные на клиент при загрузке',
        component: ServerMfModuleMounter,
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
