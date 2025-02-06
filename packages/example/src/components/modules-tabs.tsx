import React, { useState } from 'react';

import { Tab, Tabs } from '@alfalab/core-components/tabs';
import { Typography } from '@alfalab/core-components/typography';

import { AbstractModule } from '#/module-mounters/abstract-module';
import { CompatModuleMounter } from '#/module-mounters/compat-module-mounter';
import { FactoryCompatModuleMaunter } from '#/module-mounters/factory-compat-module-mounter';
import { ModuleMounter } from '#/module-mounters/module-mounter';
import { ServerStateCompatModuleMounter } from '#/module-mounters/server-state-compat-module-mounter';
import { ServerStateFactoryModuleMounter } from '#/module-mounters/server-state-factory-module-mounter';
import { ServerStateModuleMounter } from '#/module-mounters/server-state-module-mounter';
import { SuspenseMounter } from '#/module-mounters/suspense-mounter';

const tabs = {
    '1': {
        title: 'Default module',
        description: 'Стандартный модуль, который может быть подключен через default режим',
        component: ModuleMounter,
    },
    '2': {
        title: 'Compat module',
        description:
            'Модуль, сделанный через compat режим, умеет изолировать стили и работать в любом проекте',
        component: CompatModuleMounter,
    },
    '3': {
        title: 'Server state module',
        description:
            'Модуль, имеющий серверную часть, которая может отдавать предподготовленные данные на клиент при загрузке',
        component: ServerStateModuleMounter,
    },
    '4': {
        title: 'Server state compat module',
        description:
            'Модуль, имеющий серверную часть, которая может отдавать предподготовленные данные на клиент при загрузке, сделанный через compat режим',
        component: ServerStateCompatModuleMounter,
    },
    '5': {
        title: 'Abstract module',
        description: 'НЕ монтируемый модуль, который просто предоставляет какие то функции',
        component: AbstractModule,
    },
    '6': {
        title: 'Server state Factory Module',
        description: 'Модуль-фабрика, который получает состояние с сервера',
        component: ServerStateFactoryModuleMounter,
    },
    '7': {
        title: 'Factory Compat module',
        description:
            'Модуль-фабрика, сделанный через compat режим, который просто предоставляет какие то функции и данные',
        component: FactoryCompatModuleMaunter,
    },
    '8': {
        title: 'Suspense mounter',
        description: 'Монтирование модулей с помощью react.lazy',
        component: SuspenseMounter,
    }
} as const;

type TabId = keyof typeof tabs;

export const ModulesTabs = () => {
    const [activeTab, setActiveTab] = useState<TabId>('1');

    return (
        <div>
            <Tabs
                scrollable={true}
                selectedId={activeTab}
                onChange={(_, { selectedId }) => {
                    setActiveTab(selectedId as TabId);
                }}
            >
                {Object.keys(tabs).map((tabKey) => (
                    <Tab id={tabKey} title={tabs[tabKey as TabId].title} key={tabKey} />
                ))}
            </Tabs>

            <div>
                <Typography.Text>{tabs[activeTab].description}</Typography.Text>
                {React.createElement(tabs[activeTab].component)}
            </div>
        </div>
    );
};
