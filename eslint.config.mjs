import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: ['.local/**', 'docs/**'],
}, {
  rules: {
    'test/prefer-lowercase-title': ['error', { ignore: ['it'] }],
  },
})
