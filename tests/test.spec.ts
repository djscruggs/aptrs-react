import { test, expect } from '@playwright/test';

// test('homepage', async ({ page }) => {
//   await page.goto('http://localhost:3000/');
//   await expect(page).toHaveTitle(/APTRS/);
// });
test('login failure', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('admin@anof.com');
  await page.getByPlaceholder('Enter your email').press('Tab');
  await page.getByPlaceholder('Enter password').fill('badpass');
  await page.getByRole('button', { name: 'Log in' }).click();
  
  // Expects login error message
  const message = await page.textContent('.text-sm.text-red-500')
  expect(message).toBe('Invalid credentials');

});
test('login success', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.getByPlaceholder('Enter your email').click();
  await page.getByPlaceholder('Enter your email').fill('admin@anof.com');
  await page.getByPlaceholder('Enter your email').press('Tab');
  await page.getByPlaceholder('Enter password').fill('admin');
  await page.getByRole('button', { name: 'Log in' }).click();
  
  // Expects page to redirect to Dashboard.
  const headline = await await page.textContent('h1')
  expect(headline).toBe('Dashboard');

});

test('nav links', async ({ page }) => {
await page.getByRole('link', { name: 'Dashboard' }).click();
//   await page.getByRole('link', { name: 'Dashboard' }).click();
//   await page.getByRole('link', { name: 'Companies' }).click();
//   await page.getByRole('link', { name: 'Customers' }).click();
//   await page.getByRole('link', { name: 'Projects' }).click();
//   await page.getByRole('link', { name: 'Vulnerability DB' }).click();
//   await page.getByRole('link', { name: 'Users' }).click();
// });