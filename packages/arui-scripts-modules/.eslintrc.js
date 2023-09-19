module.exports = {
    root: true,
    extends: ['custom/common'],
    parserOptions: {
      tsconfigRootDir: __dirname,
      project: [
        './tsconfig.eslint.json'
      ],
  },
};