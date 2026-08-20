const { test } = require('node:test');
const assert = require('node:assert');

const {
    parseWorkspaces,
    collectChanges,
    buildComment,
} = require('./capture-snapshot-versions.cjs');

test('parseWorkspaces drops the root workspace entry', () => {
    const stdout = '{"location":".","name":null}\n{"location":"packages/a","name":"a"}\n';
    assert.deepStrictEqual(parseWorkspaces(stdout), [{ location: 'packages/a', name: 'a' }]);
});

test('collectChanges includes only non-private changed packages', () => {
    const workspaces = [
        { location: 'packages/a', name: 'a' },
        { location: 'packages/b', name: 'b' },
        { location: 'packages/c', name: 'c' },
    ];
    const pkgs = {
        'packages/a': { name: 'a', version: '1.0.0-next-1' },
        'packages/b': { name: 'b', version: '1.0.0', private: true },
        'packages/c': { name: 'c', version: '1.0.0' },
    };
    const heads = { 'packages/a': '1.0.0', 'packages/c': '1.0.0' };

    const changes = collectChanges(
        workspaces,
        (loc) => pkgs[loc],
        (loc) => heads[loc] ?? null,
    );

    assert.deepStrictEqual(changes, [{ name: 'a', from: '1.0.0', to: '1.0.0-next-1' }]);
});

test('collectChanges marks a brand-new package with from=null', () => {
    const changes = collectChanges(
        [{ location: 'packages/new', name: 'new' }],
        () => ({ name: 'new', version: '0.1.0-next-1' }),
        () => null,
    );

    assert.deepStrictEqual(changes, [{ name: 'new', from: null, to: '0.1.0-next-1' }]);
});

test('buildComment returns empty string when there are no changes', () => {
    assert.strictEqual(buildComment([], 'next'), '');
});

test('buildComment renders a table row with an npm link and the tag', () => {
    const body = buildComment(
        [{ name: 'arui-scripts', from: '23.3.0', to: '23.3.0-next-1' }],
        'next',
    );

    assert.match(
        body,
        /\| arui-scripts \| \[23\.3\.0-next-1\]\(https:\/\/www\.npmjs\.com\/package\/arui-scripts\/v\/23\.3\.0-next-1\) \|/,
    );
    assert.match(body, /Тег: `next`/);
});
