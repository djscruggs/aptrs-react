import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const componentsDir = join(__dirname, 'src', 'components');
const pagesDir = join(__dirname, 'src', 'pages');

function extractDefaultExportName(fileContent) {
  const functionComponentRegex = /export\s+default\s+function\s+(\w+)/;
  const arrowFunctionComponentRegex = /export\s+default\s+const\s+(\w+)\s*=/;
  const variableExportRegex = /export\s+default\s+(\w+)/;

  const functionMatch = fileContent.match(functionComponentRegex);
  const arrowFunctionMatch = fileContent.match(arrowFunctionComponentRegex);
  const variableMatch = fileContent.match(variableExportRegex);

  if (functionMatch) return functionMatch[1];
  if (arrowFunctionMatch) return arrowFunctionMatch[1];
  if (variableMatch) return variableMatch[1];

  return null;
}

const testTemplate = (componentName) => `
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ${componentName} from './${componentName}';

describe('${componentName}', () => {
  it('renders without crashing', () => {
    render(<${componentName} />);
    // Add more specific tests here
  });

  it('displays expected content', () => {
    render(<${componentName} />);
    // Add expectations for specific content
    // expect(screen.getByText(/your text/i)).toBeDefined();
  });

  // Add more test cases as needed
});
`;

function generateTestFile(filePath) {
  const dirName = dirname(filePath);
  const baseName = filePath.split('/').pop().split('.')[0];
  const testFilePath = join(dirName, `${baseName}.test.tsx`);
  
  const fileContent = fs.readFileSync(filePath, 'utf8');
  const componentName = extractDefaultExportName(fileContent) || baseName;
  
  fs.writeFileSync(testFilePath, testTemplate(componentName));
  console.log(`Generated test file: ${testFilePath} for component: ${componentName}`);
}

function traverseDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`Directory does not exist: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.test.tsx')) {
      generateTestFile(filePath);
    }
  });
}

console.log('Generating tests for components...');
traverseDirectory(componentsDir);

console.log('Generating tests for pages...');
traverseDirectory(pagesDir);

console.log('Test generation complete.');