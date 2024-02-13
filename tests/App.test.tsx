// Imports
import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent  from '@testing-library/user-event';

// To Test
import App from '../src/App';
import projects from '../src/pages/projects';

// Tests 
describe('Renders main page and handles auth correctly', async () => {

    it('Should have a login buton on the home screen', async () => {
        // Setup
        await render(<App />);
        const button = await screen.queryByText('Log in');

        expect(button).toBeInTheDocument();
    });
    it('Should redirect to home page for protected pages', async () => {
        // Setup
        await render(<projects />);
        const button = await screen.queryByText('Log in');

        // Post Expectations
        expect(button).toBeInTheDocument();
    });
    

    
});