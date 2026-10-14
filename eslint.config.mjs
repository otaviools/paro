import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    'no-inline-comments': 'error',
    'no-warning-comments': 'error',
    'max-lines-per-function': ['error', { max: 30, skipBlankLines: true }],
    '@typescript-eslint/no-explicit-any': 'error',
  },
}, {
  files: ['**/*.vue'],
  rules: {
    'max-lines-per-function': 'off',
  },
})
