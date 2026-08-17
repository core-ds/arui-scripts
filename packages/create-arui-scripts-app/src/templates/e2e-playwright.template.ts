import { type TemplateContext } from '../types';

function baseUrl(ctx: TemplateContext): string {
    return `http://localhost:${ctx.clientServerPort}`;
}

export function playwrightConfigTemplate(ctx: TemplateContext): string {
    const url = baseUrl(ctx);

    return `import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: '${url}',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'yarn start',
        url: '${url}',
        reuseExistingServer: !process.env.CI,
    },
});
`;
}

export function playwrightHelpersTemplate(): string {
    return `import { type Page } from '@playwright/test';

export async function gotoHome(page: Page): Promise<void> {
    await page.goto('/');
}
`;
}

export function playwrightExampleSpecTemplate(): string {
    return `import { expect, test } from '@playwright/test';

import { gotoHome } from './helpers';

test('home page loads', async ({ page }) => {
    await gotoHome(page);
    await expect(page.locator('body')).toBeVisible();
});
`;
}
