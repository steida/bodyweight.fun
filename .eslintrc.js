module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'next/core-web-vitals',
  ],
  rules: {
    // Unnecessary.
    'react/display-name': 'off',
    'react/no-unescaped-entities': 'off', // strings will be in i18n
    'jsx-a11y/alt-text': 'off', // RNfW accessibility label
    '@typescript-eslint/explicit-module-boundary-types': 'off', // YOLO
    '@typescript-eslint/no-floating-promises': 'off', // We use fp-ts Task.
    '@typescript-eslint/no-explicit-any': 'off', // We use it for generic args.
    // Must.
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'error', // No console in production.
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'error',
  },
};
