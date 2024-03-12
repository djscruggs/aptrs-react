import App from './App'
import { render, screen } from './lib/test-utils'
import { beforeAll, describe, expect, expectTypeOf, test } from 'vitest';
import userEvent from '@testing-library/user-event'

describe('Simple working test', () => {
  test('the home  page renders', () => {
    render(<App />)
    expect(screen.getByText(/Click me/i)).toBeInTheDocument()
  })

  
})