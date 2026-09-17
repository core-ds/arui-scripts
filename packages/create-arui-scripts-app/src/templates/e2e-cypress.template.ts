import { type TemplateContext } from '../types';

function baseUrl(ctx: TemplateContext): string {
    return `http://localhost:${ctx.clientServerPort}`;
}

export function cypressConfigTemplate(ctx: TemplateContext): string {
    return `import { defineConfig } from 'cypress';

export default defineConfig({
    video: false,
    e2e: {
        baseUrl: '${baseUrl(ctx)}',
        specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
        supportFile: 'cypress/support/e2e.ts',
    },
});
`;
}

export function cypressSupportE2eTemplate(): string {
    return `import './commands';
`;
}

export function cypressSupportCommandsTemplate(): string {
    return `// Кастомные команды Cypress.
// Пример:
// Cypress.Commands.add('login', (email, password) => { ... })

export {};

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Cypress {
        interface Chainable {
            // login(email: string, password: string): Chainable<void>;
        }
    }
}
`;
}

export function cypressExampleSpecTemplate(): string {
    return `describe('home page', () => {
    it('loads', () => {
        cy.visit('/');
        cy.get('body').should('be.visible');
    });
});
`;
}
