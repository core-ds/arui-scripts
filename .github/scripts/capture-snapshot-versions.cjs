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
        .map((c) => `| ${c.name} | [${c.to}](https://www.npmjs.com/package/${c.name}/v/${c.to}) |`)
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
        execSync('yarn workspaces list --json', { stdio: ['pipe'] }).toString(),
    );
    const changes = collectChanges(
        workspaces,
        (loc) => JSON.parse(fs.readFileSync(path.join(ROOT, loc, 'package.json'), 'utf8')),
        readHeadVersion,
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
            `### Snapshot release (\`${prefix}\`)\n\n${lines.join('\n')}\n`,
        );
    }
}

if (require.main === module) {
    main();
}

module.exports = { parseWorkspaces, collectChanges, buildComment };
