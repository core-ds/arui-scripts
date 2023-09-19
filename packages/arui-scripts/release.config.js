// TODO: remove eslint-disable-next-line
const betaChannelName = process.env.NPM_CHANNEL || 'next';

if (betaChannelName === 'latest') {
    throw new Error('You should not publish latest channel with manual workflow');
}

module.exports = {
    plugins: [
        '@semantic-release/commit-analyzer',
        '@semantic-release/release-notes-generator',
        '@semantic-release/changelog',
        '@semantic-release/npm',
        '@semantic-release/git',
    ],
    branches: [
        { name: 'master' },
        { name: '*', channel: betaChannelName, prerelease: true },
        {
            name: '*/*',
            channel: betaChannelName,
            // eslint-disable-next-line no-template-curly-in-string
            prerelease: '${name.replace(/[^0-9A-Za-z-]/g, "-")}',
        },
    ],
    repositoryUrl: 'git@github.com:core-ds/arui-scripts.git',
};
