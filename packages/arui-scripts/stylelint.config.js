module.exports = {
    extends: require.resolve('arui-presets-lint/stylelint'),
    rules: {
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
    },
};
