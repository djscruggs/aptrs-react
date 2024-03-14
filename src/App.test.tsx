import { render, screen } from './lib/test-utils'
import { beforeAll, describe, expect, expectTypeOf, test } from 'vitest';
import App from './App'
import React from 'react'
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event'

describe('Simple working test', () => {
  test('the home  page renders', () => {
    const element = 
        <BrowserRouter >
            <App />
        </BrowserRouter>
    render(element)
    expect(screen.getByText(/Welcome!/i)).toBeInTheDocument()
  })

  
})