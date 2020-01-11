module.exports = {
  root: true, // make to not take in any user specified rules in parent folders
  parser: 'babel-eslint',
  extends: ['airbnb', 'prettier', 'prettier/flowtype', 'prettier/react'],
  env: {
    browser: true,
    node: true,
    jest: true
  },
  plugins: ['flowtype'],
  rules: {
    'react/prop-types': 0,
    'react/jsx-filename-extension': 0
  }
};
