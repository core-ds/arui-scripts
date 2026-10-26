import { createComment, formatChange } from '../comment';

const sizes = { total: 300, js: 100, css: 100, html: 20, other: 80 };

it.each([
    [100, 0, '+100 B (new)'],
    [0, 0, '0 B (0.0%)'],
    [0, 100, '-100 B (-100.0%)'],
    [100, 100, '0 B (0.0%)'],
    [1536, 1024, '+512 B (+50.0%)'],
    [1024, 2048, '-1 KB (-50.0%)'],
])('formats %s current bytes against %s baseline bytes as %s', (current, baseline, expected) => {
    expect(formatChange(current, baseline)).toBe(expected);
});

it.each([
    ['https://binary/reports/build-1', 'https://binary/reports/build-1/client-0.html'],
    ['https://binary/reports/build-1/', 'https://binary/reports/build-1/client-0.html'],
    [undefined, 'client-0.html'],
])('resolves report links against %s', (reportUrl, expected) => {
    const comment = createComment({
        current: sizes,
        baseline: sizes,
        comparisons: [{ name: 'classic', status: 'compared', htmlFile: 'client-0.html' }],
        reportUrl,
    });

    expect(comment).toContain(`[📦 Bundle Diff Report: classic](${expected})`);
});

it('escapes labels and configuration names without allowing extra Markdown lines or links', () => {
    const comment = createComment({
        current: sizes,
        baseline: sizes,
        currentLabel: 'feature\n| injected |',
        baselineLabel: 'target\r<script>',
        comparisons: [
            { name: 'main](https://example.com)', status: 'compared', htmlFile: 'client-0.html' },
            { name: 'new_*[client]', status: 'added' },
            { name: 'old|client', status: 'removed' },
        ],
    });

    expect(comment).toContain('Current: feature \\| injected \\|');
    expect(comment).toContain('Baseline: target \\<script\\>');
    expect(comment).toContain(
        '[📦 Bundle Diff Report: main\\](https://example.com)](client-0.html)',
    );
    expect(comment).toContain('Новая клиентская конфигурация: new\\_\\*\\[client\\]');
    expect(comment).toContain('Удаленная клиентская конфигурация: old\\|client');
    expect(comment).not.toContain('\n| injected |');
});

it('keeps an unavailable baseline distinct from a measured zero-sized baseline', () => {
    const missing = createComment({ current: sizes, comparisons: [] });
    const empty = createComment({
        current: sizes,
        baseline: { total: 0, js: 0, css: 0, html: 0, other: 0 },
        comparisons: [],
    });

    expect(missing).toContain('| 📄 JavaScript | 100 B |  |  |');
    expect(missing).toContain('Baseline для точного коммита');
    expect(empty).toContain('| 📄 JavaScript | 100 B | 0 B | +100 B (new) |');
    expect(empty).not.toContain('Baseline для точного коммита');
});
