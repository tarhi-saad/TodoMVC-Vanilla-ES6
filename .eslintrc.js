module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true,
  },
  extends: 'airbnb-base',
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    // This error trigger even for array methods (map, reduce...)
    'no-param-reassign': [2, { props: false }],
    // This error trigger when importing devDependencies packages
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        optionalDependencies: true,
        peerDependencies: false,
      },
    ],
    'operator-linebreak': ['off'],
    'object-curly-newline': ['off'],
    'implicit-arrow-linebreak': ['off'],
    'no-unused-expressions': ['error', { allowTernary: true }],
  },
};
