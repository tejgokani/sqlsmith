#!/usr/bin/env node

/**
 * SQLSmith CLI Entry Point
 */

import { runCLI } from '../src/cli.js';

const args = process.argv.slice(2);

if (args.length === 0) {
  args.push('help');
}

runCLI(args).catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
