/**
 * Simple logger utility
 */

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

export function log(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

export function success(message) {
  log(`✓ ${message}`, 'green');
}

export function error(message) {
  log(`✗ ${message}`, 'red');
}

export function warn(message) {
  log(`⚠ ${message}`, 'yellow');
}

export function info(message) {
  log(`ℹ ${message}`, 'cyan');
}
