**Goal:** Make snapshot release versions visible — logged in the workflow and posted as a PR comment.

**Architecture:** A new self-contained Node script `.github/scripts/capture-snapshot-versions.cjs` runs after `changeset version --snapshot` and compares workspace `package.json` versions between HEAD and the working tree. Changed non-private packages are written to `snapshot-release-versions.txt` (JSON), rendered into `comment-body.md` (markdown table) and `$GITHUB_STEP_SUMMARY`, and printed to stdout. The workflow then publishes as before and, if an open PR exists for the branch, comments on it via `gh`. Script is testable with Node's built-in `node:test` (no new deps).

**Tech Stack:** Node 22 (built-in `node:test`, `node:assert`), GitHub Actions, `gh` CLI, Yarn 4 workspaces, Changesets.

**Spec:** `docs/specs/2026-08-05-snapshot-release-versions.md`

---

### File Structure

- Create: `.github/scripts/capture-snapshot-versions.cjs` — collects version changes; exports pure functions `parseWorkspaces`, `collectChanges`, `buildComment`; runs `main()` only when executed directly.
- Create: `.github/scripts/capture-snapshot-versions.test.cjs` — unit tests for the three pure functions.
- Modify: `.github/workflows/snapshot-release.yml` — split the combined step into `Test and version snapshot` + `Publish snapshot release`, insert `Collect snapshot versions`, append `Comment PR with released versions`.

---

### Task 1: Write the failing tests

**Files:**
- Create: `.github/scripts/capture-snapshot-versions.test.cjs`

- [ ] **Step 1: Create the test file**

Create `.github/scripts/capture-snapshot-versions.test.cjs`:

```js
const { test } = require('node:test');
const assert = require('node:assert');

const {
    parseWorkspaces,
    collectChanges,
    buildComment,
} = require('./capture-snapshot-versions.cjs');

test('parseWorkspaces drops the root workspace entry', () => {
    const stdout = '{"location":".","name":null}\n{"location":"packages/a","name":"a"}\n';
    assert.deepStrictEqual(parseWorkspaces(stdout), [
        { location: 'packages/a', name: 'a' },
    ]);
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
        (loc) => heads[loc] ?? null
    );

    assert.deepStrictEqual(changes, [
        { name: 'a', from: '1.0.0', to: '1.0.0-next-1' },
    ]);
});

test('collectChanges marks a brand-new package with from=null', () => {
    const changes = collectChanges(
        [{ location: 'packages/new', name: 'new' }],
        () => ({ name: 'new', version: '0.1.0-next-1' }),
        () => null
    );

    assert.deepStrictEqual(changes, [
        { name: 'new', from: null, to: '0.1.0-next-1' },
    ]);
});

test('buildComment returns empty string when there are no changes', () => {
    assert.strictEqual(buildComment([], 'next'), '');
});

test('buildComment renders a table row with an npm link and the tag', () => {
    const body = buildComment(
        [{ name: 'arui-scripts', from: '23.3.0', to: '23.3.0-next-1' }],
        'next'
    );

    assert.match(body, /\| arui-scripts \| \[23\.3\.0-next-1\]\(https:\/\/www\.npmjs\.com\/package\/arui-scripts\/v\/23\.3\.0-next-1\) \|/);
    assert.match(body, /Тег: `next`/);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test .github/scripts/capture-snapshot-versions.test.cjs`
Expected: FAIL — the module `./capture-snapshot-versions.cjs` does not exist.

- [ ] **Step 3: Commit**

```bash
git add .github/scripts/capture-snapshot-versions.test.cjs
git commit -m "test(ci): capture snapshot release versions"
```

---

### Task 2: Implement the capture script

**Files:**
- Create: `.github/scripts/capture-snapshot-versions.cjs`

- [ ] **Step 1: Create the script**

Create `.github/scripts/capture-snapshot-versions.cjs`:

```js
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = process.cwd();

function parseWorkspaces(stdout) {
    return stdout
        .split('\n')
        .filter(Boolean)
        .map((line) => JSON.parse(line))
        .filter((entry) => entry.location && entry.location !== '.');
}

function collectChanges(workspaces, readPkg, readHead) {
    const changes = [];
    for (const ws of workspaces) {
        let pkg;
        try {
            pkg = readPkg(ws.location);
        } catch {
            continue;
        }
        if (pkg.private) {
            continue;
        }
        const from = readHead(ws.location);
        if (from !== pkg.version) {
            changes.push({ name: pkg.name, from, to: pkg.version });
        }
    }
    return changes;
}

function buildComment(changes, prefix) {
    if (changes.length === 0) {
        return '';
    }
    const rows = changes
        .map(
            (c) =>
                `| ${c.name} | [${c.to}](https://www.npmjs.com/package/${c.name}/v/${c.to}) |`
        )
        .join('\n');
    return `## Snapshot release (\`${prefix}\`)\n\nОпубликованы снапшот-версии:\n\n| Пакет | Версия |\n| --- | --- |\n${rows}\n\nТег: \`${prefix}\`\n`;
}

function readHeadVersion(location) {
    try {
        const out = execSync(`git show HEAD:${location}/package.json`, {
            encoding: 'utf8',
        });
        return JSON.parse(out).version;
    } catch {
        return null;
    }
}

function main() {
    const prefix = process.argv[2] || 'next';

    const workspaces = parseWorkspaces(
        execSync('yarn workspaces list --json', { stdio: ['pipe'] }).toString()
    );
    const changes = collectChanges(
        workspaces,
        (loc) => JSON.parse(fs.readFileSync(path.join(ROOT, loc, 'package.json'), 'utf8')),
        readHeadVersion
    );

    fs.writeFileSync('snapshot-release-versions.txt', JSON.stringify(changes, null, 2));
    fs.writeFileSync('comment-body.md', buildComment(changes, prefix));

    if (changes.length === 0) {
        console.log('No snapshot version changes');
        return;
    }

    const lines = changes.map((c) => `- ${c.name}: ${c.from ?? '(new)'} → ${c.to}`);
    console.log(lines.join('\n'));

    const summaryPath = process.env.GITHUB_STEP_SUMMARY;
    if (summaryPath) {
        fs.appendFileSync(
            summaryPath,
            `### Snapshot release (\`${prefix}\`)\n\n${lines.join('\n')}\n`
        );
    }
}

if (require.main === module) {
    main();
}

module.exports = { parseWorkspaces, collectChanges, buildComment };
```

- [ ] **Step 2: Run the tests to verify they pass**

Run: `node --test .github/scripts/capture-snapshot-versions.test.cjs`
Expected: PASS (5 tests).

- [ ] **Step 3: Commit**

```bash
git add .github/scripts/capture-snapshot-versions.cjs
git commit -m "feat(ci): capture snapshot release versions"
```

---

### Task 3: Verify the script against the repo

- [ ] **Step 1: Run the script with no pending changes**

Run: `node .github/scripts/capture-snapshot-versions.cjs next`
Expected: stdout `No snapshot version changes`; `snapshot-release-versions.txt` contains `[]`; `comment-body.md` is empty.

- [ ] **Step 2: Simulate a snapshot bump and re-run**

Temporarily bump a public package version, e.g.:

```bash
node -e "const p=require('./packages/client-event-bus/package.json');p.version='2.1.0-next-999';require('fs').writeFileSync('./packages/client-event-bus/package.json',JSON.stringify(p,null,2)+'\n')"
node .github/scripts/capture-snapshot-versions.cjs next
```

Expected: stdout lists `- @alfalab/client-event-bus: 2.1.0 → 2.1.0-next-999`; `snapshot-release-versions.txt` has one entry; `comment-body.md` contains a table row with the npm link.

- [ ] **Step 3: Revert the simulated bump**

```bash
git checkout -- packages/client-event-bus/package.json
git status --short
```

Expected: working tree clean (apart from untracked `snapshot-release-versions.txt` and `comment-body.md`).

- [ ] **Step 4: Remove generated files and commit**

```bash
rm snapshot-release-versions.txt comment-body.md
```

No commit needed for this task (nothing new to add).

---

### Task 4: Update the workflow

**Files:**
- Modify: `.github/workflows/snapshot-release.yml`

- [ ] **Step 1: Rewrite the workflow**

Replace the whole file with:

```yaml
name: Create snapshot release of packages

on:
  workflow_dispatch:
    inputs:
      prefix:
        description: 'Custom prefix for snapshot version'
        required: true
        default: 'next'

permissions:
  contents: read
  pull-requests: write

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v4

      - name: Setup Node.js 22.x
        uses: actions/setup-node@v4
        with:
          node-version: 22.x

      - name: Install Dependencies
        run: yarn install --immutable

      - name: Test and version snapshot
        run: |
            yarn run turbo test build
            yarn run changeset version --snapshot ${{ github.event.inputs.prefix }}
        env:
          GITHUB_TOKEN: ${{ secrets.GH_TOKEN }}

      - name: Collect snapshot versions
        run: node .github/scripts/capture-snapshot-versions.cjs ${{ github.event.inputs.prefix }}

      - name: Publish snapshot release
        run: yarn workspaces foreach --all --no-private npm publish --tolerate-republish --access public --tag next
        env:
          YARN_NPM_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Comment PR with released versions
        run: |
            PR=$(gh pr list --repo "$GITHUB_REPOSITORY" --head "$GITHUB_REF_NAME" --state open --json number --jq '.[0].number')
            if [ -n "$PR" ] && [ -s comment-body.md ]; then
              gh pr comment "$PR" --repo "$GITHUB_REPOSITORY" --body-file comment-body.md
            fi
        env:
          GH_TOKEN: ${{ secrets.GH_TOKEN }}
```

Notes:
- `$GITHUB_REF_NAME` is the branch name on `workflow_dispatch`; `gh pr list --head <branch>` finds the open PR.
- `comment-body.md` is empty when no versions changed, so the `-s` guard skips commenting.
- `GITHUB_STEP_SUMMARY` is provided automatically by GitHub Actions to every step; the script writes to it.
- The script reads/writes files in the workspace root, which persists between steps in the job.

- [ ] **Step 2: Validate the YAML parses**

Run: `node -e "require('js-yaml').load(require('fs').readFileSync('.github/workflows/snapshot-release.yml','utf8')); console.log('YAML OK')"`
Expected: `YAML OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/snapshot-release.yml
git commit -m "feat(ci): comment PR with snapshot release versions"
```

---

### Task 5: Final verification

- [ ] **Step 1: Run the full test suite for the script**

Run: `node --test .github/scripts/capture-snapshot-versions.test.cjs`
Expected: PASS.

- [ ] **Step 2: Confirm repo lint/build are unaffected**

Run: `yarn run lint`
Expected: PASS (no lint errors introduced; `.github/scripts` is not a workspace so it is not linted, and nothing in packages changed).

- [ ] **Step 3: Confirm git state**

Run: `git status --short`
Expected: only the three committed files, no stray generated files.
