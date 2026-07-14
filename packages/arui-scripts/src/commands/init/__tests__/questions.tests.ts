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
            true, // cssModules
            8080, // clientServerPort
            // serverPort пропущен
            '', // dockerRegistry
            '', // presets
            false, // polyfills
            false, // reactCompiler
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
            true, // cssModules
            8080, // clientServerPort
            3001, // serverPort
            '', // dockerRegistry
            '', // presets
            false, // polyfills
            false, // reactCompiler
            false, // install
        ]);

        const answers = await prompts(getQuestions('app'));

        expect(answers.clientOnly).toBe(false);
        expect(answers.serverPort).toBe(3001);
    });
});
