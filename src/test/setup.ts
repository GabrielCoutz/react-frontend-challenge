import '@testing-library/jest-dom'
import { configureAxe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

export const axe = configureAxe({
  rules: {
    'color-contrast': { enabled: false },
  },
})
