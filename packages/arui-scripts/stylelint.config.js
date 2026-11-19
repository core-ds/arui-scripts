module.exports = {
    extends: 'arui-presets-lint/stylelint',
    rules: {
        'selector-pseudo-class-no-unknown': [
            true,
            {
                ignorePseudoClasses: ['global'],
            },
        ],
    },
};
