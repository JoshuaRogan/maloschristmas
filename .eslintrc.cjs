/* Unified ESLint + Prettier config */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    jest: true,
  },
  extends: [
    'react-app',
    'react-app/jest',
    'plugin:prettier/recommended', // enables eslint-plugin-prettier + displays Prettier issues as lint errors
  ],
  plugins: ['prettier'],
  rules: {
    // Prettier settings inlined so a single source (optional; could rely on .prettierrc)
    'prettier/prettier': [
      'warn',
      {
        printWidth: 100,
        singleQuote: true,
        trailingComma: 'all',
        semi: true,
        arrowParens: 'always',
        endOfLine: 'lf',
      },
    ],
  },
  overrides: [
    {
      files: ['**/*.test.{js,jsx}'],
      env: { jest: true },
    },
  ],
};
