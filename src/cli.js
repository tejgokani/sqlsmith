/**
 * SQLSmith CLI
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateSQL, diffSchemas, migrate, generatePolicies } from './index.js';
import { success, error, info, warn } from './utils/logger.js';
import { writeFile, readFile, fileExists } from './utils/fileWriter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runCLI(args) {
  const command = args[0];

  switch (command) {
    case 'init':
      return await initCommand(args.slice(1));
    case 'generate':
      return await generateCommand(args.slice(1));
    case 'migrate':
      return await migrateCommand(args.slice(1));
    case 'diff':
      return await diffCommand(args.slice(1));
    case 'policies':
      return await policiesCommand(args.slice(1));
    case 'help':
    case '--help':
    case '-h':
      return showHelp();
    default:
      error(`Unknown command: ${command}`);
      showHelp();
      process.exit(1);
  }
}

async function initCommand(args) {
  info('Initializing SQLSmith...');

  // Create config file
  const configPath = './sqlsmith.config.js';
  if (fileExists(configPath)) {
    warn('sqlsmith.config.js already exists');
  } else {
    const configContent = `export default {
  schema: 'public',
  namingStrategy: 'snake_case',
  timestamps: true,
  jsonForObjects: true,
  foreignKeyStrategy: 'inline',
  policyGeneration: false,
  supabaseDir: './supabase/migrations',
  typeOverrides: {},
};
`;
    writeFile(configPath, configContent);
  }

  // Create example schema
  const examplePath = './schema.example.js';
  if (fileExists(examplePath)) {
    warn('schema.example.js already exists');
  } else {
    const exampleContent = `export default {
  users: {
    id: "uuid:pk",
    name: "text:notnull",
    email: "text:unique:notnull",
    age: "integer:default=18",
    profile: {
      bio: "text",
      avatar_url: "text"
    },
    created_at: "timestamptz:default=now()"
  },
  profiles: {
    id: "uuid:pk",
    user_id: "uuid:fk=users.id",
    visibility: "text:default='public'"
  }
};
`;
    writeFile(examplePath, exampleContent);
  }

  success('SQLSmith initialized successfully!');
  info('Next steps:');
  info('  1. Edit schema.example.js to define your schema');
  info('  2. Run: npx sqlsmith generate --schema=schema.example.js');
}

async function generateCommand(args) {
  const schemaFile = getArg(args, '--schema');
  const outFile = getArg(args, '--out') || './schema.sql';

  if (!schemaFile) {
    error('Missing --schema argument');
    info('Usage: sqlsmith generate --schema=<file> [--out=<file>]');
    process.exit(1);
  }

  info(`Generating SQL from ${schemaFile}...`);

  // Load schema
  const schema = await loadSchema(schemaFile);
  const config = await loadConfig();

  // Generate SQL
  const sql = generateSQL(schema, config);

  // Write output
  writeFile(outFile, sql);
  success(`SQL generated: ${outFile}`);
}

async function migrateCommand(args) {
  const schemaFile = getArg(args, '--schema');
  const dir = getArg(args, '--dir') || './supabase/migrations';
  const message = getArg(args, '--message') || 'migration';

  if (!schemaFile) {
    error('Missing --schema argument');
    info('Usage: sqlsmith migrate --schema=<file> [--dir=<dir>] [--message=<msg>]');
    process.exit(1);
  }

  info(`Creating migration from ${schemaFile}...`);

  // Load schema
  const schema = await loadSchema(schemaFile);
  const config = await loadConfig();

  // Generate migration
  const filePath = migrate(schema, dir, message, config);

  if (filePath) {
    success(`Migration created: ${filePath}`);
  } else {
    error('Failed to create migration');
    process.exit(1);
  }
}

async function diffCommand(args) {
  const fromFile = getArg(args, '--from');
  const toFile = getArg(args, '--to');
  const outFile = getArg(args, '--out') || './diff.sql';

  if (!fromFile || !toFile) {
    error('Missing --from or --to argument');
    info('Usage: sqlsmith diff --from=<file> --to=<file> [--out=<file>]');
    process.exit(1);
  }

  info(`Generating diff from ${fromFile} to ${toFile}...`);

  // Load schemas
  const oldSchema = await loadSchema(fromFile);
  const newSchema = await loadSchema(toFile);
  const config = await loadConfig();

  // Generate diff
  const sql = diffSchemas(oldSchema, newSchema, config);

  // Write output
  writeFile(outFile, sql);
  success(`Diff SQL generated: ${outFile}`);
}

async function policiesCommand(args) {
  const table = getArg(args, '--table');
  const outFile = getArg(args, '--out') || './policies.sql';

  if (!table) {
    error('Missing --table argument');
    info('Usage: sqlsmith policies --table=<tablename> [--out=<file>]');
    process.exit(1);
  }

  info(`Generating RLS policies for ${table}...`);

  const config = await loadConfig();
  const sql = generatePolicies(table, config);

  writeFile(outFile, sql);
  success(`Policies generated: ${outFile}`);
}

function showHelp() {
  console.log(`
SQLSmith - JavaScript Schema to Postgres Migration Generator

USAGE:
  sqlsmith <command> [options]

COMMANDS:
  init                   Create sqlsmith.config.js and example schema
  generate               Generate SQL from schema object
  migrate                Generate timestamped migration file
  diff                   Generate ALTER statements from schema differences
  policies               Generate Supabase RLS policy templates
  help                   Show this help message

OPTIONS:
  --schema=<file>        Path to schema file (required for generate/migrate/diff)
  --out=<file>           Output file path
  --dir=<directory>      Migration directory (default: ./supabase/migrations)
  --message=<msg>        Migration message
  --from=<file>          Old schema file (for diff)
  --to=<file>            New schema file (for diff)
  --table=<name>         Table name (for policies)

EXAMPLES:
  sqlsmith init
  sqlsmith generate --schema=schema.js --out=schema.sql
  sqlsmith migrate --schema=schema.js --message="init"
  sqlsmith diff --from=old.js --to=new.js --out=diff.sql
  sqlsmith policies --table=users --out=policies.sql

For more information, visit: https://github.com/YOUR_USERNAME/sqlsmith
`);
}

// Helper functions

function getArg(args, name) {
  for (const arg of args) {
    if (arg.startsWith(`${name}=`)) {
      return arg.substring(name.length + 1);
    }
  }
  return null;
}

async function loadSchema(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);

  if (!fileExists(absolutePath)) {
    error(`Schema file not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const module = await import(`file://${absolutePath}`);
    return module.default || module;
  } catch (err) {
    error(`Failed to load schema: ${err.message}`);
    process.exit(1);
  }
}

async function loadConfig() {
  const configPath = path.resolve(process.cwd(), 'sqlsmith.config.js');

  if (!fileExists(configPath)) {
    return {};
  }

  try {
    const module = await import(`file://${configPath}`);
    return module.default || module;
  } catch (err) {
    warn(`Failed to load config: ${err.message}`);
    return {};
  }
}
