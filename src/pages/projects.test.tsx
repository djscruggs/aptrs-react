import { Projects } from './projects'


import { render, screen } from '../lib/test-utils'
import {describe, expect, test } from 'vitest';
import { MemoryRouter as Router } from "react-router-dom";
import '@testing-library/jest-dom';

describe('Simple working test',  () => {
  beforeEach(async () => {
    render(
            <Router>
              <Projects pageTitle="Projects" />
            </Router>
          )
  });
  test('the projects page renders', async () => {
    const  title = screen.getByText(/Projects/i)
    const button = await screen.getByText('New Project')
    const search = await screen.getByText('Search')
    expect(title).toBeInTheDocument()
    expect(button).toBeInTheDocument()
    expect(search).toBeInTheDocument()
    
    
  })
  

  
})