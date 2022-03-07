module.exports = {
  env: {
    es6: true,
  },
  extends: [
    'airbnb-base',
    'plugin:import/recommended',
  ],
  plugins: [
    'import',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
      },
    },
  },
  rules: {
    'space-before-function-paren': ['error', 'always'],
    'object-shorthand': ['error', 'never'],
    'max-len': 0,
    'no-underscore-dangle': 0,
    'import/no-unresolved': 0,
    'import/extensions': 0,
    'no-shadow': 0,
    'import/prefer-default-export': 0,
    'import/no-cycle': 0,
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx', '*.ts', '*.tsx'],
      excludedFiles: '*.spec.ts',
      extends: [
        'plugin:import/typescript',
        'plugin:@typescript-eslint/recommended',
      ],
      plugins: [
        '@typescript-eslint',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaVersion: 2020,
        project: './tsconfig.json',
        sourceType: 'module',
      },
      rules: {
        '@typescript-eslint/no-non-null-assertion': 0,
      },
    },
    // JEST
    {
      files: ['*.spec.ts', '**/*.spec.ts'],
      extends: [
        'plugin:jest/all',
        'plugin:import/recommended',
      ],
      plugins: [
        'jest',
        'import',
      ],
      parser: '@typescript-eslint/parser',
      rules: {
        'import/extensions': 0,
        'import/no-extraneous-dependencies': 0,
        '@typescript-eslint/no-explicit-any': 0,
      },
    },
  ],
};
