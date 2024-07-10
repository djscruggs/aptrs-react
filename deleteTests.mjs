import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, 'src');

function deleteTestFile(filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log(`Deleted test file: ${filePath}`);
  } catch (err) {
    console.error(`Error deleting file ${filePath}: ${err.message}`);
  }
}

function traverseDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      traverseDirectory(filePath);
    } else if (file.endsWith('.test.tsx')) {
      deleteTestFile(filePath);
    }
  });
}

traverseDirectory(srcDir);
console.log('Deletion of test files complete.');