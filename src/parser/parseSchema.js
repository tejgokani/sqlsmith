import { validateSchema } from './validateSchema.js';
import { mapType } from '../generator/typeMapper.js';

/**
 * Parse schema object into AST
 * 
 * Schema format:
 * {
 *   tableName: {
 *     columnName: "type:modifier1:modifier2",
 *     nestedObject: { ... }
 *   }
 * }
 * 
 * AST format:
 * {
 *   tables: {
 *     tableName: {
 *       columns: [
 *         { name, type, constraints: { pk, notnull, unique, default, fk } }
 *       ],
 *       foreignKeys: []
 *     }
 *   }
 * }
 */
export function parseSchema(schema, config = {}) {
  // Validate schema first
  validateSchema(schema);

  const ast = { tables: {} };

  for (const [tableName, tableSchema] of Object.entries(schema)) {
    ast.tables[tableName] = parseTable(tableName, tableSchema, config);
  }

  return ast;
}

function parseTable(tableName, tableSchema, config) {
  const table = {
    name: tableName,
    columns: [],
    foreignKeys: [],
  };

  for (const [columnName, columnDef] of Object.entries(tableSchema)) {
    if (typeof columnDef === 'string') {
      // Shorthand format
      const column = parseShorthand(columnName, columnDef, config);
      table.columns.push(column);

      // Extract foreign key if present
      if (column.constraints.fk) {
        table.foreignKeys.push({
          column: columnName,
          references: column.constraints.fk,
        });
      }
    } else if (typeof columnDef === 'object') {
      // Nested object - convert to jsonb or separate table
      if (config.foreignKeyStrategy === 'separateTable') {
        // This would require more complex logic
        // For now, default to jsonb
        table.columns.push({
          name: columnName,
          type: 'jsonb',
          constraints: {},
        });
      } else {
        // Default: store as jsonb
        table.columns.push({
          name: columnName,
          type: config.jsonForObjects !== false ? 'jsonb' : 'text',
          constraints: {},
        });
      }
    }
  }

  // Add timestamps if configured
  if (config.timestamps) {
    const timestampCols = typeof config.timestamps === 'object' 
      ? config.timestamps 
      : { created_at: true, updated_at: true };

    if (timestampCols.created_at && !table.columns.find(c => c.name === 'created_at')) {
      table.columns.push({
        name: 'created_at',
        type: 'timestamptz',
        constraints: { default: 'now()' },
      });
    }

    if (timestampCols.updated_at && !table.columns.find(c => c.name === 'updated_at')) {
      table.columns.push({
        name: 'updated_at',
        type: 'timestamptz',
        constraints: { default: 'now()' },
      });
    }
  }

  return table;
}

/**
 * Parse shorthand column definition
 * Format: "type:pk:notnull:unique:default=value:fk=table.column"
 */
function parseShorthand(columnName, shorthand, config) {
  const parts = shorthand.split(':');
  const type = mapType(parts[0], config);

  const constraints = {};

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];

    if (part === 'pk') {
      constraints.pk = true;
      constraints.notnull = true; // Primary keys are always NOT NULL
    } else if (part === 'notnull') {
      constraints.notnull = true;
    } else if (part === 'unique') {
      constraints.unique = true;
    } else if (part.startsWith('default=')) {
      constraints.default = part.substring(8);
    } else if (part.startsWith('fk=')) {
      const fkRef = part.substring(3);
      const [refTable, refColumn] = fkRef.split('.');
      constraints.fk = { table: refTable, column: refColumn || 'id' };
    }
  }

  return {
    name: columnName,
    type,
    constraints,
  };
}

/**
 * Apply naming strategy to table/column names
 */
export function applyNamingStrategy(name, strategy = 'snake_case') {
  if (strategy === 'snake_case') {
    return name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
  }
  return name;
}
