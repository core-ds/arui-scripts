import { Graph } from '@rsdoctor/utils/common';

import { type Bundle } from './snapshot';

export type Sizes = {
    total: number;
    js: number;
    css: number;
    html: number;
    other: number;
};

// Предсжатые копии дублируют те же JS и CSS, поэтому не входят в размеры.
const PRECOMPRESSED_ASSET = /\.(gz|br)$/;

export function getSizes(bundles: Bundle[]): Sizes {
    return bundles.reduce(
        (sizes, { data: { chunkGraph } }) => {
            const summary = Graph.getAssetsSummary(
                chunkGraph.assets.filter((asset) => !PRECOMPRESSED_ASSET.test(asset.path)),
                chunkGraph.chunks,
                { withFileContent: false },
            );
            const total = summary.all.total.size;
            const js = summary.js.total.size;
            const css = summary.css.total.size;
            const html = summary.html.total.size;

            return {
                total: sizes.total + total,
                js: sizes.js + js,
                css: sizes.css + css,
                html: sizes.html + html,
                other: sizes.other + total - js - css - html,
            };
        },
        { total: 0, js: 0, css: 0, html: 0, other: 0 },
    );
}
