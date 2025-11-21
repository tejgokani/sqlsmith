import fs from 'fs';
import path from 'path';
import { error, success } from './logger.js';

/**
 * Write content to a file
 */
export function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    
    // Ensure directory exists
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, content, 'utf-8');
    success(`File written: ${filePath}`);
    return true;
  } catch (err) {
    error(`Failed to write file: ${err.message}`);
    return false;
  }
}

/**
 * Read file content
 */
export function readFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      error(`File not found: ${filePath}`);
      return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    error(`Failed to read file: ${err.message}`);
    return null;
  }
}

/**
 * Check if file exists
 */
export function fileExists(filePath) {
  return fs.existsSync(filePath);
}
