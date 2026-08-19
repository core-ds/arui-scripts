import prompts from 'prompts';

import { getQuestions } from '../questions';

describe('getQuestions', () => {
    it('пропускает serverPort в режиме clientOnly', async () => {
        // Порядок ответов соответствует порядку вопросов; serverPort пропускается.
        prompts.inject([
            'app', // name
            false, // useRtk
            true, // clientOnly
            'swc', // codeLoader
            'jest', // testRunner
            'none', // e2eFramework
            false, // useRouter
            'none', // moduleRole
            true, // cssModules
            8080, // clientServerPort
            // serverPort пропущен
            '', // dockerRegistry
            '', // presets
            false, // polyfills
            false, // reactCompiler
            false, // useLint
            false, // install
        ]);

        const answers = await prompts(getQuestions('app'));

        expect(answers.clientOnly).toBe(true);
        expect(answers.serverPort).toBeUndefined();
    });

    it('спрашивает serverPort для SSR-приложения', async () => {
        prompts.inject([
            'app', // name
            false, // useRtk
            false, // clientOnly
            'swc', // codeLoader
            'jest', // testRunner
            'none', // e2eFramework
            false, // useRouter
            'none', // moduleRole
            true, // cssModules
            8080, // clientServerPort
            3001, // serverPort
            '', // dockerRegistry
            '', // presets
            false, // polyfills
            false, // reactCompiler
            false, // useLint
            false, // install
        ]);

        const answers = await prompts(getQuestions('app'));

        expect(answers.clientOnly).toBe(false);
        expect(answers.serverPort).toBe(3001);
    });

    it('пропускает вопросы, отвеченные флагами (prefill)', async () => {
        // clientOnly, codeLoader и testRunner заданы флагами — их вопросы не задаются,
        // serverPort пропускается из-за clientOnly-флага.
        prompts.inject([
            'app', // name
            false, // useRtk
            'none', // e2eFramework
            false, // useRouter
            'none', // moduleRole
            true, // cssModules
            8080, // clientServerPort
            '', // dockerRegistry
            '', // presets
            false, // polyfills
            false, // reactCompiler
            false, // useLint
            false, // install
        ]);

        const answers = await prompts(
            getQuestions('app', { clientOnly: true, codeLoader: 'swc', testRunner: 'jest' }),
        );

        expect(answers.clientOnly).toBeUndefined();
        expect(answers.codeLoader).toBeUndefined();
        expect(answers.testRunner).toBeUndefined();
        expect(answers.serverPort).toBeUndefined();
        expect(answers.name).toBe('app');
        expect(answers.install).toBe(false);
    });

    it('пропускает e2eFramework, когда он задан флагом', async () => {
        prompts.inject([
            'app', // name
            false, // useRtk
            true, // clientOnly
            'swc', // codeLoader
            'jest', // testRunner
            // e2eFramework задан флагом
            false, // useRouter
            'none', // moduleRole
            true, // cssModules
            8080, // clientServerPort
            '', // dockerRegistry
            '', // presets
            false, // polyfills
            false, // reactCompiler
            false, // useLint
            false, // install
        ]);

        const answers = await prompts(getQuestions('app', { e2eFramework: 'playwright' }));

        expect(answers.e2eFramework).toBeUndefined();
    });

    it('пропускает serverPort, когда он задан флагом', async () => {
        prompts.inject([
            'app', // name
            false, // useRtk
            false, // clientOnly (SSR)
            'swc', // codeLoader
            'jest', // testRunner
            'cypress', // e2eFramework
            false, // useRouter
            'none', // moduleRole
            true, // cssModules
            8080, // clientServerPort
            // serverPort задан флагом — вопрос пропущен
            '', // dockerRegistry
            '', // presets
            false, // polyfills
            false, // reactCompiler
            true, // useLint
            false, // install
        ]);

        const answers = await prompts(getQuestions('app', { serverPort: 3005 }));

        expect(answers.clientOnly).toBe(false);
        expect(answers.serverPort).toBeUndefined();
        expect(answers.e2eFramework).toBe('cypress');
        expect(answers.useLint).toBe(true);
    });
});
