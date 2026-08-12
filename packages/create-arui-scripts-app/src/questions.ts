import type prompts from 'prompts';

import { type CliFlags } from './defaults';
import { validateProjectName } from './validate-project-name';

type QuestionType = prompts.PromptObject['type'];

export function getQuestions(defaultName: string, prefill: CliFlags = {}): prompts.PromptObject[] {
    const unlessAnswered = (key: keyof CliFlags, type: QuestionType): QuestionType =>
        prefill[key] === undefined ? type : null;

    return [
        {
            type: unlessAnswered('name', 'text'),
            name: 'name',
            message: 'Имя проекта',
            initial: defaultName,
            validate: (value: string) => validateProjectName(value),
        },
        {
            type: unlessAnswered('useRtk', 'select'),
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
            type: unlessAnswered('clientOnly', 'select'),
            name: 'clientOnly',
            message: 'Тип приложения',
            initial: 0,
            choices: [
                { title: 'SSR', value: false, description: 'Клиент + Node-сервер' },
                { title: 'clientOnly', value: true, description: 'Статика, без сервера' },
            ],
        },
        {
            type: unlessAnswered('codeLoader', 'select'),
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
            type: unlessAnswered('testRunner', 'select'),
            name: 'testRunner',
            message: 'На чем писать тесты',
            initial: 0,
            choices: [
                { title: 'Jest', value: 'jest', description: 'Классика' },
                { title: 'Vitest', value: 'vitest', description: 'Быстрее, на базе Vite' },
            ],
        },
        {
            type: unlessAnswered('e2eFramework', 'select'),
            name: 'e2eFramework',
            message: 'e2e фреймворк',
            initial: 2,
            choices: [
                { title: 'Cypress', value: 'cypress', description: 'классический e2e фреймворк' },
                {
                    title: 'Playwright',
                    value: 'playwright',
                    description: 'Быстрый и современный e2e фреймворку',
                },
                { title: 'Без e2e', value: 'none', description: 'Не подключать e2e' },
            ],
        },
        {
            type: unlessAnswered('cssModules', 'toggle'),
            name: 'cssModules',
            message: 'Использовать CSS-модули',
            initial: true,
            active: 'да',
            inactive: 'нет',
        },
        {
            type: unlessAnswered('clientServerPort', 'number'),
            name: 'clientServerPort',
            message: 'Порт dev-сервера (клиент)',
            initial: 8080,
        },
        {
            // Пропускаем порт сервера для clientOnly приложений
            // и когда он уже задан флагом.
            type: (_prev, values) => {
                const clientOnly = prefill.clientOnly ?? values.clientOnly;

                if (clientOnly || prefill.serverPort !== undefined) {
                    return null;
                }

                return 'number';
            },
            name: 'serverPort',
            message: 'Порт node-сервера',
            initial: 3000,
        },
        {
            type: unlessAnswered('dockerRegistry', 'text'),
            name: 'dockerRegistry',
            message: 'Docker registry (Enter - пропустить)',
            initial: '',
        },
        {
            type: unlessAnswered('presets', 'text'),
            name: 'presets',
            message: 'Preset-пакет (Enter - пропустить)',
            initial: '',
        },
        {
            type: unlessAnswered('polyfills', 'toggle'),
            name: 'polyfills',
            message: 'Добавить полифилы (core-js)',
            initial: false,
            active: 'да',
            inactive: 'нет',
        },
        {
            type: unlessAnswered('reactCompiler', 'toggle'),
            name: 'reactCompiler',
            message: 'Включить experimentalReactCompiler',
            initial: false,
            active: 'да',
            inactive: 'нет',
        },
        {
            type: unlessAnswered('useLint', 'toggle'),
            name: 'useLint',
            message: 'Подключить arui-presets-lint',
            initial: false,
            active: 'да',
            inactive: 'нет',
        },
        {
            type: unlessAnswered('install', 'toggle'),
            name: 'install',
            message: 'Установить зависимости сейчас',
            initial: false,
            active: 'да',
            inactive: 'нет',
        },
    ];
}
