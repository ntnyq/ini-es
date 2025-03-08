// @ts-check

import { defineESLintConfig } from '@ntnyq/eslint-config'

export default defineESLintConfig({
  node: {
    overrides: {
      'node/prefer-global/process': 'off',
    },
  },
  perfectionist: {
    all: true,
  },
})
