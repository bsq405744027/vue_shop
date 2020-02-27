module.exports = {
  root: true,
  parserOptions: {
    parser: 'babel-eslint'
  },
  env: {
    browser: true
  },
  extends: [
    'plugin:vue/essential',
    'standard'
  ],
  plugins: ['vue'],
  rules: {
    'no-console': 'off',
    indent: ['error', 2, { SwitchCase: 1 }],
    semi: 0,
    'space-before-function-paren': [
      'error',
      { anonymous: 'always', named: 'never' }
    ],
    'generator-star-spacing': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}