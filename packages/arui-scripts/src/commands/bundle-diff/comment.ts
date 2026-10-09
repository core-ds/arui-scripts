import filesize from 'filesize';

import { rsdoctorVersion } from '../util/rsdoctor-snapshot';

import { type BundleComparison } from './artifacts';
import { type Sizes } from './sizes';

export type BaselineIssue = 'missing' | 'incompatible';

type CommentOptions = {
    current: Sizes;
    baseline?: Sizes;
    baselineIssue?: BaselineIssue;
    comparisons: BundleComparison[];
    reportUrl?: string;
    currentLabel?: string;
    baselineLabel?: string;
};

const baselineIssueMessages: Record<BaselineIssue, string> = {
    missing:
        'Baseline для точного коммита целевой ветки отсутствует. Запустите ее сборку с rsdoctor и повторите сборку PR. Сравнение и HTML diff пока недоступны.',
    incompatible: `Baseline целевой ветки собран другой версией Rsdoctor, а эта сборка использует Rsdoctor ${rsdoctorVersion}. Сравнение станет доступно, когда целевая ветка будет собрана с этой версией arui-scripts, например после мержа PR.`,
};

export function formatChange(current: number, baseline: number): string {
    const delta = current - baseline;
    // filesize сам добавляет минус к отрицательным значениям
    const sign = delta > 0 ? '+' : '';

    let percent = '0.0%';

    if (baseline > 0) {
        percent = `${sign}${((delta / baseline) * 100).toFixed(1)}%`;
    } else if (current > 0) {
        percent = 'new';
    }

    return `${sign}${filesize(delta)} (${percent})`;
}

function escapeMarkdown(text: string): string {
    return text.replace(/[\\`*_{}[\]<>|]/g, '\\$&').replace(/[\r\n]/g, ' ');
}

export function createComment(options: CommentOptions): string {
    const { current, baseline, comparisons, reportUrl } = options;
    const lines = [
        '## Rsdoctor Bundle Diff Analysis',
        '',
        `Current: ${escapeMarkdown(options.currentLabel || 'current build')}`,
        `Baseline: ${escapeMarkdown(options.baselineLabel || 'target branch')}`,
        '',
        '| Metric | Current | Baseline | Change |',
        '| --- | ---: | ---: | ---: |',
    ];
    const metrics: Array<[keyof Sizes, string]> = [
        ['total', '📊 Total Size'],
        ['js', '📄 JavaScript'],
        ['css', '🎨 CSS'],
        ['html', '🌐 HTML'],
        ['other', '📁 Other Assets'],
    ];

    metrics.forEach(([key, label]) => {
        lines.push(
            `| ${label} | ${filesize(current[key])} | ${
                baseline ? filesize(baseline[key]) : ''
            } | ${baseline ? formatChange(current[key], baseline[key]) : ''} |`,
        );
    });

    lines.push(
        '',
        'Размеры emitted assets без source maps и предсжатых .gz/.br копий, по правилам Rsdoctor.',
    );

    if (baseline === undefined) {
        lines.push('', baselineIssueMessages[options.baselineIssue ?? 'missing']);
    } else {
        comparisons.forEach((comparison) => {
            const name = escapeMarkdown(comparison.name);

            if (comparison.status === 'added') {
                lines.push(
                    '',
                    `Новая клиентская конфигурация: ${name}. Размер включен в таблицу; HTML diff для нее недоступен.`,
                );
            } else if (comparison.status === 'removed') {
                lines.push(
                    '',
                    `Удаленная клиентская конфигурация: ${name}. Размер включен в изменение таблицы.`,
                );
            } else {
                const link = reportUrl
                    ? new URL(comparison.htmlFile, `${reportUrl.replace(/\/$/, '')}/`).href
                    : comparison.htmlFile;

                lines.push('', `[📦 Bundle Diff Report: ${name}](${link})`);
            }
        });
    }

    lines.push('');

    return lines.join('\n');
}
