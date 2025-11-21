/**
 * Main SQLSmith API
 */

import { parseSchema } from './parser/parseSchema.js';
import { generateCreateSQL } from './generator/sqlCreate.js';
import { generateAlterSQL } from './generator/sqlAlter.js';
import { writeSupabaseMigration } from './integrator/supabaseWriter.js';
import { generateBasicPolicies } from './integrator/policyGenerator.js';

/**
 * Generate SQL from a schema object
 */
export function generateSQL(schema, config = {}) {
  const ast = parseSchema(schema, config);
  const sql = generateCreateSQL(ast, config);
  return sql;
}

/**
 * Generate ALTER statements from schema differences
 */
export function diffSchemas(oldSchema, newSchema, config = {}) {
  return generateAlterSQL(oldSchema, newSchema, config);
}

/**
 * Generate migration file
 */
export function migrate(schema, outputDir, message = 'migration', config = {}) {
  const sql = generateSQL(schema, config);
  const migrateConfig = { ...config, supabaseDir: outputDir };
  return writeSupabaseMigration(sql, message, migrateConfig);
}

/**
 * Generate RLS policies for a table
 */
export function generatePolicies(tableName, config = {}) {
  return generateBasicPolicies(tableName, config);
}

// Re-export utilities
export { parseSchema } from './parser/parseSchema.js';
export { validateSchema } from './parser/validateSchema.js';
export { generateCreateSQL } from './generator/sqlCreate.js';
export { generateAlterSQL } from './generator/sqlAlter.js';
export { mapType } from './generator/typeMapper.js';
