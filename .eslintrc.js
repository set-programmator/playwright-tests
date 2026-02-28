module.exports = {
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    'plugin:playwright/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    'no-console': 'off',
    'prefer-const': 'error',
    'no-var': 'error',
    'no-unused-vars': 'warn',
    // Playwright specific rules
    'playwright/expect-expect': 'error',
    'playwright/no-conditional-in-test': 'error',
    'playwright/no-skipped-test': 'warn',
    'playwright/valid-expect': 'error',
  },
  ignorePatterns: ['node_modules/', 'dist/', 'reports/', 'test-results/', 'allure-results/'],
  overrides: [
    {
      files: ['*.ts'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      rules: {
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': 'warn',
        '@typescript-eslint/no-explicit-any': 'warn',
      },
    },
    {
      files: ['*.js'],
      env: {
        node: true,
        commonjs: true,
      },
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        console: 'readonly',
        fs: 'readonly',
        path: 'readonly',
      },
    },
  ],
};
