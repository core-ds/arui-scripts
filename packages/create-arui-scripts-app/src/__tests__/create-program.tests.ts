import { createProgram } from '../create-program';
import { type CliFlags } from '../defaults';

async function parseFlags(args: string[]): Promise<CliFlags> {
    const calls: CliFlags[] = [];

    const program = createProgram(async (_dir, flags) => {
        calls.push(flags);
    });

    program.exitOverride();
    program.configureOutput({ writeOut: () => {}, writeErr: () => {} });

    await program.parseAsync(args, { from: 'user' });

    return calls[0];
}

describe('createProgram', () => {
    it('без флагов не фиксирует ответы (все вопросы зададутся мастером)', async () => {
        await expect(parseFlags(['my-app'])).resolves.toEqual({});
    });

    it('позитивные флаги дают true', async () => {
        const flags = await parseFlags([
            '--rtk',
            '--css-modules',
            '--lint',
            '--install',
            '--router',
        ]);

        expect(flags.useRtk).toBe(true);
        expect(flags.cssModules).toBe(true);
        expect(flags.useLint).toBe(true);
        expect(flags.install).toBe(true);
        expect(flags.useRouter).toBe(true);
    });

    it('--no-* флаги дают false', async () => {
        const flags = await parseFlags([
            '--no-rtk',
            '--no-css-modules',
            '--no-polyfills',
            '--no-react-compiler',
            '--no-router',
            '--no-lint',
            '--no-install',
        ]);

        expect(flags.useRtk).toBe(false);
        expect(flags.cssModules).toBe(false);
        expect(flags.polyfills).toBe(false);
        expect(flags.reactCompiler).toBe(false);
        expect(flags.useRouter).toBe(false);
        expect(flags.useLint).toBe(false);
        expect(flags.install).toBe(false);
    });

    it('--ssr и --client-only управляют clientOnly и конфликтуют между собой', async () => {
        await expect(parseFlags(['--client-only'])).resolves.toEqual({ clientOnly: true });
        await expect(parseFlags(['--ssr'])).resolves.toEqual({ clientOnly: false });

        await expect(parseFlags(['--client-only', '--ssr'])).rejects.toThrow();
    });

    it('--e2e-framework парсит cypress, playwright и none', async () => {
        await expect(parseFlags(['--e2e-framework', 'playwright'])).resolves.toEqual({
            e2eFramework: 'playwright',
        });
        await expect(parseFlags(['--e2e-framework', 'cypress'])).resolves.toEqual({
            e2eFramework: 'cypress',
        });
        await expect(parseFlags(['--e2e-framework', 'none'])).resolves.toEqual({
            e2eFramework: 'none',
        });
    });

    it('--router и --no-router управляют useRouter', async () => {
        await expect(parseFlags(['--router'])).resolves.toEqual({ useRouter: true });
        await expect(parseFlags(['--no-router'])).resolves.toEqual({ useRouter: false });
    });
});
