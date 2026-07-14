import type prompts from 'prompts';

export function getQuestions(defaultName: string): prompts.PromptObject[] {
    return [
        {
            type: 'text',
            name: 'name',
            message: 'Имя проекта',
            initial: defaultName,
            validate: (value: string) =>
                value && value.trim().length > 0 ? true : 'Имя проекта не может быть пустым',
        },
        {
            type: 'select',
            name: 'useRtk',
            message: 'Стек проекта',
            initial: 0,
            choices: [
                { title: 'React', value: false, description: 'Только React и хуки' },
                {
                    title: 'React + RTK',
                    value: true,
                    description: 'Redux Toolkit для управления состоянием',
                },
            ],
        },
        {
            type: 'select',
            name: 'clientOnly',
            message: 'Тип приложения',
            initial: 0,
            choices: [
                { title: 'SSR', value: false, description: 'Клиент + Node-сервер' },
                { title: 'clientOnly', value: true, description: 'Статика, без сервера' },
            ],
        },
        {
            type: 'select',
            name: 'codeLoader',
            message: 'Транспилятор кода',
            initial: 0,
            choices: [
                { title: 'swc', value: 'swc', description: 'Самый быстрый' },
                { title: 'babel', value: 'babel', description: 'Максимальная совместимость' },
                { title: 'tsc', value: 'tsc', description: 'Через TypeScript-компилятор' },
            ],
        },
        {
            type: 'select',
            name: 'testRunner',
            message: 'На чем писать тесты',
            initial: 0,
            choices: [
                { title: 'Jest', value: 'jest', description: 'Классика' },
                { title: 'Vitest', value: 'vitest', description: 'Быстрее, на базе Vite' },
            ],
        },
        {
            type: 'toggle',
            name: 'cssModules',
            message: 'Использовать CSS-модули в примере',
            initial: true,
            active: 'да',
            inactive: 'нет',
        },
        {
            type: 'number',
            name: 'clientServerPort',
            message: 'Порт dev-сервера (клиент)',
            initial: 8080,
        },
        {
            // Пропускаем порт сервера для clientOnly-приложений.
            type: (_prev, values) => (values.clientOnly ? null : 'number'),
            name: 'serverPort',
            message: 'Порт node-сервера',
            initial: 3000,
        },
        {
            type: 'text',
            name: 'dockerRegistry',
            message: 'Docker registry (Enter - пропустить)',
            initial: '',
        },
        {
            type: 'text',
            name: 'presets',
            message: 'Preset-пакет (Enter - пропустить)',
            initial: '',
        },
        {
            type: 'toggle',
            name: 'polyfills',
            message: 'Добавить полифилы (core-js)',
            initial: false,
            active: 'да',
            inactive: 'нет',
        },
        {
            type: 'toggle',
            name: 'reactCompiler',
            message: 'Включить experimentalReactCompiler',
            initial: false,
            active: 'да',
            inactive: 'нет',
        },
        {
            type: 'toggle',
            name: 'install',
            message: 'Установить зависимости сейчас',
            initial: false,
            active: 'да',
            inactive: 'нет',
        },
    ];
}
