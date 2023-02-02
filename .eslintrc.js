module.exports = {
  ignorePatterns: ['src/**/*.js'],
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    semi: ['warn', 'always'],
    'arrow-parens': ['off'],
    '@typescript-eslint/no-namespace': "off",
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/strict-boolean-expressions': ['error'],
  },
};
