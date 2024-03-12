import Login from './login'
import { render, screen, fireEvent, userEvent } from '../lib/test-utils'
import {describe, expect, test } from 'vitest';
import '@testing-library/jest-dom';

describe('Simple working test', () => {
  beforeEach(async () => {
    render(<Login />)
  });
  test('the login page renders', () => {
    expect(screen.getByText(/Email/i)).toBeInTheDocument()
    expect(screen.getByText(/Password/i)).toBeInTheDocument()
  })
  test('the login fields change', async () => {
    const email = screen.getByLabelText('Email')
    await userEvent.type(email, 'test@test.com')
    expect(email).toHaveValue('test@test.com')

    const password = screen.getByLabelText('Password')
    await userEvent.type(password, 'mypassword')
    expect(password).toHaveValue('mypassword')

    const button = screen.getByText('Log in')
    fireEvent.click(button)
    const changedButton = screen.getByText('Please wait')
    expect(changedButton).toBeInTheDocument()
    
  })

  
})