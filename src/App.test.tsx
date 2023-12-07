import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';
import Login from './pages/login';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/log in/i);
  expect(linkElement).toBeInTheDocument();
});
test('Home page renders correctly', () => {
  render(<App />);
  const homeValue = screen.getByText(/Welcome!/i);
  expect(homeValue).toBeInTheDocument();
});

test('Login page renders correctly', () => {
  render(<Login />);
  const loginValue = screen.getByText(/Please log in to continue./i);
  expect(loginValue).toBeInTheDocument();
});

test('Redirects to login for companies routes', () => {
  // Write your test code here to navigate to a companies route
  // and assert that it redirects to the login page
});